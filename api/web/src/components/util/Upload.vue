<template>
    <div class='col col--12 py12 px12 border border--gray-light round'>
        <div id='dragndrop' class='col col--12'>

            <div class='col col--12' :class='{ "none": progress !== 0 }'>
                <div class='pb12 flex flex--center-main' v-text='label'></div>
                <div class='flex flex--center-main'>
                    <button @click='$refs.fileInput.click()' class='btn btn--stroke round color-gray color-green-on-hover'>Upload File</button>
                </div>
                <form>
                    <input
                        ref='fileInput'
                        class='none'
                        type='file'
                        id='file'
                        name='file'
                        :accept='mimetype'
                        @change='upload'
                    />
                </form>
            </div>

            <div v-if='progress && progress < 101' class='col col--12'>
                <Loading/>

                <div class='align-center txt-truncate' v-text='name'></div>

                <div class='col col--12 border border--gray-light round h12 my12'>
                    <div :style='{ "width": progress + "%" }' class='h-full bg-gray-light'></div>
                </div>
            </div>
            <div v-else-if='progress === 101'>
                <div class='flex flex--center-main'>
                    <svg class='icon color-green w60 h60'><use href='#icon-check'/></svg>
                </div>
                <div class='align-center'>Upload Complete</div>
                <div class='col col--12 clearfix pt12'>
                    <template v-if='single'>
                        <button @click='$emit("ok", done)' class='btn round btn--stroke fr btn--gray'>OK</button>
                    </template>
                    <template v-else>
                        <button @click='refresh' class='btn round btn--stroke fr btn--gray'>
                            <svg class='fl icon' style='margin-top: 6px;'><use href='#icon-refresh'/></svg>Upload
                        </button>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Loading from './Loading.vue';

export default {
    name: 'UploadFile',
    props: {
        single: {
            type: Boolean,
            default: false
        },
        url: URL,
        headers: {
            type: Object,
            default: function() {
                return {};
            }
        },
        label: {
            type: String,
            default: 'Select a raster to upload'
        },
        mimetype: {
            type: String,
            default: '*'
        }
    },
    data: function() {
        return {
            name: '',
            progress: 0,
            done: null
        }
    },
    methods: {
        refresh: function() {
            this.name = '';
            this.progress = 0;
            const input = this.$refs.fileInput;
            input.type = 'text';
            input.type = 'file';
        },
        upload: function(event) {
            const file = event.target.files[0];
            this.name = file.name;

            const xhr = new XMLHttpRequest()
            const formData = new FormData()

            xhr.open('POST', this.url, true)
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

            for (const header of Object.keys(this.headers)) {
                xhr.setRequestHeader(header, this.headers[header]);
            }

            xhr.upload.addEventListener('progress', (e) => {
                this.progress = (e.loaded * 100.0 / e.total) || 100
            });

            xhr.addEventListener('readystatechange', () => {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    this.progress = 100;
                } else if (xhr.readyState == 4 && xhr.status != 200) {
                    this.$emit('err', new Error('Failed to upload file'));
                }

                this.progress = 101;

                this.done = JSON.parse(xhr.responseText);
                this.$emit('done', this.done);
            });

            formData.append('file', file)
            xhr.send(formData)
        }
    },
    components: {
        Loading
    }
}

</script>
