<template>
  <el-container class="app">
    <el-header class="header">
      <div class="logo">File system</div>
      <div class="logout" @click="logout">Log out</div>
      <div class="email">{{ email + ' ('+role+')' }}</div>
    </el-header>
    <el-container>
      <!-- <el-aside class="aside">
        <el-menu class="el-menu-vertical" router :default-active="pathToIndex[activePath]">
          <el-menu-item index="1" route="/main" @click="saveNavStatus('/main')">
            <i class="el-icon-menu"></i>
            <span slot="title">Image Detection</span>
          </el-menu-item>
          <el-menu-item index="2" route="/subscribe" @click="saveNavStatus('/subscribe')">
            <i class="el-icon-menu"></i>
            <span slot="title">User Subscribe</span>
          </el-menu-item>
        </el-menu>
      </el-aside> -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      role: ''
    }
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
  },
  created() {
    this.email = window.sessionStorage.getItem('email')
    this.role = window.sessionStorage.getItem('role')
  }
}
</script>

<style lang="less" scoped>
.app {
  width: 100%;
  height: 100%;
  .header {
    width: 100%;
    height: 100px !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
    .logo {
      float: left;
      margin-left: 1%;
      height: 100%;
      text-align: center;
      line-height: 100px;
      font-weight: 500;
      font-size: 40px;
    }
    .email {
      float: right;
      height: 100%;
      margin-right: 30px;
      text-align: center;
      font-size: 25px;
      line-height: 100px;
    }
    .logout {
      float: right;
      height: 100%;
      text-align: center;
      color: gray;
      font-size: 20px;
      line-height: 100px;
      cursor: pointer;
    }
    .logout:hover {
      color: rgb(199, 198, 198);
    }
  }
  .aside {
    width: 13% !important;
    min-width: 300px;
    box-sizing: content-box;
    padding-top: 5px;
    .el-menu-vertical {
      height: 100%;
    }
  }
}
</style>
