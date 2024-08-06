<template>
  <div class="main" v-loading="loading" element-loading-text="Loading...">
    <div class="upload_area" v-if="this.role == 'admin'">
      <div class="upload_area_button">
        <el-button slot="trigger" size="medium" type="danger" :disabled="this.selectedFilenameForDelete.length == 0" @click="handleDelete">Delete File</el-button>
      </div>
      <el-upload class="upload_area_button" ref="upload" action="http://localhost:8080/upload" :show-file-list="false" :auto-upload="false" :on-change="handleUpload">
        <el-button slot="trigger" size="medium" type="primary">Upload</el-button>
      </el-upload>
    </div>
    <div class="search_area" ref="search_area">
      <el-input v-model="search_text" placeholder="Please enter the file name to search" clearable></el-input>
      <el-button type="primary" @click="search_files">Search</el-button>
    </div>
    <div class="file_list">
      <div v-for="(item,index) in fileList" :key="index" class="file_card">
        <el-checkbox v-model="selectedFilenameForDelete" :label="item" class="thumbnail_checkbox">{{''}}</el-checkbox>
        <el-image class="thumbnail" src="/file-logo.svg" fit="cover" @click="downloadFile(item)" :title="item"></el-image>
        <div class="file_name">{{item}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import crypto from 'crypto-js';
import JSEncrypt from 'jsencrypt';
export default {
  data() {
    return {
      search_text: '',
      fileList: [],
      key: null,
      iv: null,
      public_key: `-----BEGIN PUBLIC KEY-----
      MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2vBZ5umkt1a4Il7eOO3t
      byrMY1qhLOP+KhhZnjvDP6UCoKNpias8q54WThO0qRX63LlolTVN4V+mkpxSzDIh
      PJXXLX0x04WTNEviyJLTOwNt9UjmX88vp5TcFhI155ydBEwuii4LblzPuTVKd5a2
      5hCIEKhyUIbwGIwie9mDVxZd1y8DWGSl+pSxpV9p/3JMSIWIm94PQS/PPD52k+EC
      /MGc9tOknAALLlfx416YYzLji2g3F+fAuioTxYvN/9J3fwZo3wYzQ3OUiPlwzzPB
      xr8S7TqWyBUAlmn49bc0ok5kwQCHG9ZKE9fTUEkd8cQ+C7hVp9aBBYmcr4kbLTRH
      CQIDAQAB
      -----END PUBLIC KEY-----`,
      keyUrl: '/setkey',
      uploadUrl: '/upload',
      downloadUrl: '/download',
      selectedFilenameForDelete: [],
      loading: false,
      role: ''
    }
  },
  methods: {
    async getAllFiles() {
      this.loading = true
      const { data: res } = await this.$http.get('/files')
      console.log(res)
      if (res.code === 1) {
        this.fileList = res.data
        this.loading = false
      } else {
        this.$message({
          message: 'Get files failed! ' + res.msg,
          type: 'error'
        })
        this.loading = false
      }
    },
    search_files() {
      if (this.search_text == '' || this.search_text == null) {
        this.getAllFiles()
      } else {
        const searchText = this.search_text.toLowerCase(); // 获取并转换为小写
        this.fileList = this.fileList.filter(fileName => {
          // 提取文件原名部分
          const originalName = fileName.split('_')[0].toLowerCase();
          const originalType = fileName.split('.')[1].toLowerCase();
          return originalName.includes(searchText) || originalType.includes(searchText); // 检查是否包含查询文本
        })
      }
    },
    async handleUpload(file) {
      this.loading = true
      // 生成对称密钥
      this.key = crypto.lib.WordArray.random(32);
      this.iv = crypto.lib.WordArray.random(16);

      // 使用公钥加密对称密钥
      const encrypt = new JSEncrypt();
      encrypt.setPublicKey(this.public_key);
      const encryptedKey = encrypt.encrypt(crypto.enc.Hex.stringify(this.key));

      // 发送加密后的对称密钥给服务器
      const keyData = { userkey: encryptedKey };
      const { data: res1 } = await this.$http.post(this.keyUrl, keyData, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (res1.code === 1) {
        // 读取文件并进行加密
        const reader = new FileReader();
        reader.onload = async (e) => {
          const wordArray = crypto.lib.WordArray.create(e.target.result);

          // 计算文件哈希
          const hash = crypto.SHA256(wordArray).toString(crypto.enc.Hex);

          // 加密文件内容
          const encrypted = crypto.AES.encrypt(wordArray, this.key, {
            iv: this.iv, mode: crypto.mode.CBC,
            padding: crypto.pad.Pkcs7
          }).ciphertext;
          console.log(crypto.enc.Hex.stringify(this.iv))
          console.log(crypto.enc.Hex.stringify(encrypted))

          const encryptedArrayBuffer = this.wordArrayToArrayBuffer(encrypted);

          // 创建FormData并上传
          const formData = new FormData();
          //formData.append('file', crypto.enc.Base64.stringify(encrypted));
          //formData.append('file', Buffer.concat([iv, encrypted]), `${file.name}`);
          formData.append('file', new Blob([new Uint8Array(encryptedArrayBuffer)]), `${file.name}`);
          formData.append('type', file.name.split('.')[1]);
          formData.append('filename', file.name.split('.')[0]);
          formData.append('hash', hash);
          formData.append('hexiv', crypto.enc.Hex.stringify(this.iv));

          console.log(file.type)
          console.log(file.name)

          const { data: res2 } = await this.$http.post(this.uploadUrl, formData, {
            maxContentLength: Infinity,
            maxBodyLength: Infinity
          });
          this.loading = false
          if (res2.code === 1) {
            this.$message({
              message: 'Upload file successfully!',
              type: 'success'
            })
            this.getAllFiles()
          } else {
            this.$message({
              message: 'Upload file failed! ' + res.msg,
              type: 'error'
            })
          }
        };
        reader.readAsArrayBuffer(file.raw);
      } else {
        this.loading = false
        this.$message({
          message: 'Set key failed! ' + res.msg,
          type: 'error'
        })
      }
    },

    async downloadFile(filename) {
      this.loading = true
      // 生成对称密钥
      this.key = crypto.lib.WordArray.random(32);
      //this.iv = crypto.lib.WordArray.random(16);

      // 使用公钥加密对称密钥
      const encrypt = new JSEncrypt();
      encrypt.setPublicKey(this.public_key);
      const encryptedKey = encrypt.encrypt(crypto.enc.Hex.stringify(this.key));

      // 发送加密后的对称密钥给服务器
      const keyData = { userkey: encryptedKey };
      const { data: res1 } = await this.$http.post(this.keyUrl, keyData, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (res1.code === 1) {
        // 创建 FormData，指定文件名和类型
        const formData = new FormData();
        formData.append('type', filename.split('.')[1]);
        formData.append('filename', filename.split('.')[0]);

        // 发送请求获取加密文件
        // const response = await this.$http.post(this.downloadUrl, formData, {
        //   responseType: 'arraybuffer'
        // });
        const { data: res2 } = await this.$http.post(this.downloadUrl, formData);
        console.log(res2.data)

        const byteCharacters = atob(res2.data.base64combinedData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        /*const wordArray = crypto.enc.Base64.parse(res2.base64combinedData);
        console.log(wordArray)

        // 将 WordArray 转换为字节数组
        const byteArray = wordArray.words.reduce((arr, word) => {
          // 将每个字转换为4个字节，并加入到数组中
          arr.push((word >> 24) & 0xFF);
          arr.push((word >> 16) & 0xFF);
          arr.push((word >> 8) & 0xFF);
          arr.push(word & 0xFF);
          return arr;
        }, []).slice(0, wordArray.sigBytes); // 保留有效字节*/

        //const encryptedFileData = Uint8Array.from(btoa(res2.base64combinedData), c => c.charCodeAt(0));
        const encryptedFileData = new Uint8Array(byteNumbers);


        // 提取 IV
        const ivHex = crypto.enc.Hex.parse(crypto.enc.Hex.stringify(crypto.lib.WordArray.create(encryptedFileData.slice(0, 16))));
        //console.log(crypto.enc.Hex.stringify(crypto.lib.WordArray.create(encryptedFileData.slice(0, 16))))

        // 提取密文
        const ciphertext = crypto.lib.WordArray.create(encryptedFileData.slice(16));

        // 使用AES-256-CBC解密文件内容
        const decrypted = crypto.AES.decrypt({ ciphertext: ciphertext }, this.key, {
          iv: ivHex,
          mode: crypto.mode.CBC,
          padding: crypto.pad.Pkcs7
        });

        // 将解密的内容转换为WordArray
        const decryptedWordArray = crypto.enc.Hex.parse(crypto.enc.Hex.stringify(decrypted));
        let decryptedArrayBuffer = decryptedWordArray.words.map(word => [
          (word >> 24) & 0xff,
          (word >> 16) & 0xff,
          (word >> 8) & 0xff,
          word & 0xff
        ]).flat();

        const validLength = decrypted.sigBytes; // 获取有效字节的长度

        decryptedArrayBuffer = new Uint8Array(decryptedArrayBuffer.slice(0, validLength));
        console.log(decryptedArrayBuffer)

        // 计算解密后文件的哈希值
        const hash = crypto.SHA256(crypto.lib.WordArray.create(decryptedArrayBuffer));
        const fileHash = hash.toString(crypto.enc.Hex);


        // 取出后端返回的哈希值
        //const serverHash = response.headers.get('hash');
        const serverHash = res2.data.hash

        console.log(fileHash)
        console.log(serverHash)

        if (fileHash === serverHash) {
          // 保存文件
          const blob = new Blob([new Uint8Array(decryptedArrayBuffer)], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = filename;
          link.click();
          this.loading = false
        } else {
          this.loading = false
          this.$message({
            message: "The hashes don't match, the file may be corrupt!",
            type: 'error'
          })
        }
      } else {
        this.loading = false
        this.$message({
          message: 'Set key failed! ' + res1.msg,
          type: 'error'
        })
      }
    },
    async handleDelete() {
      this.loading = true
      console.log(this.selectedFilenameForDelete)
      const { data: res } = await this.$http.post('/deletefiles', this.selectedFilenameForDelete)
      if (res.code === 1) {
        this.loading = false
        this.$message({
          message: 'Delete successfully!',
          type: 'success'
        })
        this.getAllFiles()
      } else {
        this.loading = false
        this.$message({
          message: 'Delete error! ' + res.msg,
          type: 'error'
        })
      }
    },
    wordArrayToArrayBuffer(wordArray) {
      const len = wordArray.sigBytes;
      const u8_array = new Uint8Array(len);
      const words = wordArray.words;
      let i = 0, offset = 0, word;
      while (offset < len) {
        word = words[i++];
        u8_array[offset++] = (word >> 24) & 0xff;
        if (offset === len) break;
        u8_array[offset++] = (word >> 16) & 0xff;
        if (offset === len) break;
        u8_array[offset++] = (word >> 8) & 0xff;
        if (offset === len) break;
        u8_array[offset++] = word & 0xff;
      }
      return u8_array.buffer;
    }
  },
  created() {
    this.getAllFiles()
    this.role = window.sessionStorage.getItem('role')
  },
  mounted() {
    console.log(this.$refs.search_area)
    console.log(this.role)
    if (this.role == 'user') {
      if (this.$refs.search_area) {
        console.log(this.$refs.search_area)
        console.log(this.role)
        this.$refs.search_area.style.marginTop = '20px';
      }
    }
  }
}
</script>

<style lang="less" scoped>
.main {
  width: 100%;
  height: 100%;
  min-width: 500px;
  .upload_area {
    width: 100%;
    height: 100px;
    .upload_area_button {
      float: right;
      margin-top: 30px;
      margin-right: 40px;
    }
  }
  .search_area {
    display: flex;
    margin: 0 40px;
    .el-input {
      flex-grow: 1;
      min-width: 500px !important;
      margin-right: 10px;
    }
    .el-button {
      height: 40px;
    }
  }
  .file_list {
    margin: 0 40px;
    margin-top: 50px;
    .file_card {
      float: left;
      width: 250px;
      height: 350px;
      margin-right: 20px;
      margin-bottom: 40px;
      border: 1px solid rgb(207, 203, 203);
      border-radius: 5px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
      .el-checkbox {
        margin-top: 3px;
        margin-left: 5px;
      }
      .thumbnail {
        display: block;
        width: 90%;
        margin: 0 auto !important;
        margin-top: 15px !important;
        cursor: pointer;
      }
      .file_name {
        margin-top: 10px;
        text-align: center;
        margin-bottom: 15px !important;
        height: 60px;
        overflow: hidden;
      }
    }
  }
}
</style>