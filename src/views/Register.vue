<template>
  <div>
    <el-container>
      <el-header>
        <div class="title">File System</div>
      </el-header>
      <el-main>
        <el-card class="main">
          <h3>Sign up</h3>
          <el-form ref="registerFormRef" :model="registerForm" :rules="registerFormRules" label-width="0px">
            <div class="role-form">
              <span>Choose your role: </span>
              <el-radio v-model="registerForm.role" label="admin">Admin</el-radio>
              <el-radio v-model="registerForm.role" label="user">User</el-radio>
            </div>
            <el-form-item prop="email">
              <i class="el-icon-user-solid"></i>
              <input v-model="registerForm.email" placeholder="Input your email address" />
            </el-form-item>
            <el-form-item prop="password">
              <i class="el-icon-lock"></i>
              <input v-model="registerForm.password" placeholder="Input your password" />
            </el-form-item>
            <el-form-item prop="password2">
              <i class="el-icon-lock"></i>
              <input v-model="registerForm.password2" placeholder="Input your password again" />
            </el-form-item>
            <el-form-item class="btns">
              <button @click.prevent="register" @keydown.enter="register">Sign up</button>
              <div class="sign_up_text">Already have an account yet? <a href="#/login">Sign in</a></div>
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
      registerForm: {
        email: '',
        password: '',
        password2: '',
        role: 'admin'
      },
      registerFormRules: {
        email: [
          { required: true, message: 'Please input your email', trigger: 'blur' },
        ],
        password: [
          { required: true, message: 'Place input your password', trigger: 'blur' },
        ],
        password2: [
          { required: true, message: 'Place input your password again', trigger: 'blur' },
        ],
      },
    }
  },
  methods: {
    async register() {
      if (this.registerForm.password === this.registerForm.password2) {

        const { data: res } = await this.$http.post('/register', {
          email: this.registerForm.email,
          password: this.registerForm.password,
          role: this.registerForm.role
        })

        if (res.code === 1) {
          this.$message({
            message: 'Sign up successfully!',
            type: 'success'
          });
          this.$router.push('/login');
        } else {
          this.$message({
            message: 'Sign up failed! ' + res.msg,
            type: 'error'
          })
        }
      } else {
        this.$message({
          message: 'The passwords you entered twice are different. Please re-enter!',
          type: 'error'
        })
        this.registerForm = {
          email: '',
          password: '',
          password2: '',
          role: 'admin'
        }
      }
    },
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
.role-form {
  margin: 35px auto;
  width: 90%;
}

.role-form span {
  margin-right: 10px;
  font-size: 16px;
}

.btns {
  text-align: center;
}
.btns button {
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
.btns button:hover {
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