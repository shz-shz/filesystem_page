<template>
  <div>
    <el-container>
      <el-header>
        <div class="title">File System</div>
      </el-header>
      <el-main>
        <el-card class="main">
          <h3>Sign in</h3>
          <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" label-width="0px">
            <el-form-item prop="email">
              <i class="el-icon-user-solid"></i>
              <input v-model="loginForm.email" placeholder="Email address" />
            </el-form-item>
            <el-form-item prop="password">
              <i class="el-icon-lock"></i>
              <input v-model="loginForm.password" type="password" placeholder="Password" />
            </el-form-item>
            <el-form-item class="btns">
              <button @click.prevent="login" @keydown.enter="login" class="login_button">Sign in</button>
              <div class="sign_up_text">Doesn't have an account yet? <a href="#/register">Sign up</a></div>
            </el-form-item>
          </el-form>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>
<script>
export default {
  data() {
    return {
      loginForm: {
        email: '',
        password: ''
      },
      loginFormRules: {
        email: [
          { required: true, message: 'Please input your email', trigger: 'blur' },
        ],
        password: [
          { required: true, message: 'Place input your password', trigger: 'blur' },
        ],
      },
    }
  },
  methods: {
    async login() {
      const { data: res } = await this.$http.post('/login', this.loginForm)

      if (res.code === 1) {
        console.log(res)
        window.sessionStorage.setItem('role', res.data.role)
        window.sessionStorage.setItem('token', res.data.token)
        window.sessionStorage.setItem('email', this.loginForm.email)

        this.$message({
          message: 'Sign in successfully!',
          type: 'success'
        })
        this.$router.push('/');
      } else {
        this.$message({
          message: 'Sign in failed! ' + res.msg,
          type: 'error'
        })
      }
    },
    register() {
      this.$router.push('/register')
    }
  }
}
</script>
<style lang="less" scoped>
.el-header {
  height: 100px !important;
}
.title {
  margin: 50px auto;
  text-align: center;
  font-size: 40px;
  font-weight: 500;
}
.main {
  margin: 40px auto;
  width: 50%;
  min-width: 480px;
}
.main h3 {
  width: 80%;
  margin: 0px auto;
  margin-bottom: 20px;
  text-align: center;
  padding: 15px 0;
  border-bottom: 2px solid rgb(64, 158, 235);
}
.el-form {
  margin: auto;
  width: 70%;
}
.el-input {
  margin: 5px 0;
}
.el-form-item {
  position: relative;
  margin: 35px auto;
  width: 90%;
  text-align: center;
}
i {
  position: absolute;
  left: 13px;
  top: 18px;
}
input {
  width: 100%;
  height: 50px;
  border-radius: 8px;
  border: 2px solid rgb(206, 206, 206);
  padding: 0px 10px;
  padding-left: 33px;
  outline: none;
  box-sizing: border-box;
  transition-property: all;
  transition-duration: 0.3s;
}
input:focus {
  border: 2px solid black;
  font-size: 16px;
}
.btns {
  text-align: center;
}

.btns .login_button {
  margin: 0 50px;
  color: black;
  width: 200px;
  height: 40px;
  border: 2px solid black;
  border-radius: 8px;
  background-color: white;
  font-size: 20px;
  transition-property: all;
  transition-duration: 0.2s;
}
.btns .login_button:hover {
  border: 2px solid rgb(64, 158, 235);
  color: rgb(64, 158, 235);
  cursor: pointer;
}
.btns .sign_up_text {
  margin-top: 20px;
}

.btns .sign_up_text a {
  text-decoration: none;
  color: gray;
}
</style>