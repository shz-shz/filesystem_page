<template>
  <div class="main" v-loading="loading" element-loading-text="Loading...">
    <div class="search_area">
      <el-select v-model="selectedTagsForSubscribe" multiple filterable placeholder="Please select the tag">
        <el-option v-for="option in options" :key="option" :label="option" :value="option">
        </el-option>
      </el-select>
      <div>
        <el-button type="primary" @click="submitOptions">Subscribe</el-button>
      </div>
    </div>
    <div class="subscribe_tag_list" v-if="subscribedTags.length != 0">
      <div class="tag" v-for="(item,index) in subscribedTags" :key="index">
        <span>{{item}}</span>
        <span class="delete_subscribe_tag" @click="detele_subscribe_tag(item)">×</span>
      </div>
    </div>
    <div class="subscribe_tag_list" v-if="subscribedTags.length == 0">
      <div class="no_tag">
        You have not subscribed to any tag yet
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      options: [
        'person', 'bicycle', 'car', 'motorbike', 'aeroplane', 'bus', 'train', 'truck', 'boat',
        'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat',
        'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack',
        'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball',
        'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket',
        'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple',
        'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair',
        'sofa', 'pottedplant', 'bed', 'diningtable', 'toilet', 'tvmonitor', 'laptop', 'mouse',
        'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink', 'refrigerator',
        'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush'
      ],
      selectedTagsForSubscribe: [],
      subscribedTags: [],
      loading: false
    }
  },
  methods: {
    async submitOptions() {
      if (this.selectedTagsForSubscribe.length != 0) {
        this.loading = true
        const { data: res } = await this.$http.post('/user_subscribe', {
          user_mail: window.sessionStorage.getItem('user_mail'),
          subscribe_tags: this.selectedTagsForSubscribe
        })
        if (res) {
          this.$message({
            message: 'User subscribes to tag successfully',
            type: 'success'
          })
        }
        this.loading = false
        this.selectedTagsForSubscribe = []
        this.getSubscribedTagByUser()
      } else {
        this.$message({
          message: 'Please select at least one subscribed label',
          type: 'warning'
        })
      }
    },
    async getSubscribedTagByUser() {
      this.loading = true
      const { data: res } = await this.$http.post('/querySubscribeTagsByUser', {
        user_mail: window.sessionStorage.getItem('user_mail')
      })
      if (res.result == 200) {
        this.subscribedTags = res.msg.tags
      }
      this.loading = false
    },
    async detele_subscribe_tag(tag) {
      this.loading = true
      const { data: res } = await this.$http.post('/deleteSubscribeTagsByUser', {
        user_mail: window.sessionStorage.getItem('user_mail'),
        tags: tag
      })
      if (res.result == 200) {
        this.getSubscribedTagByUser()
        this.$message({
          message: 'Subscribed tag removed successfully!',
          type: 'success'
        })
        this.loading = false
      }
    }
  },
  created() {
    this.getSubscribedTagByUser()
  }
}
</script>

<style lang="less" scoped>
.main {
  .search_area {
    display: flex;
    justify-content: space-between;
    margin: 0 40px;
    margin-top: 40px;
    .el-select {
      width: 300% !important;
      min-width: 500px !important;
      margin-right: 10px;
    }
    div {
      width: 10%;
      height: 40px;
    }
  }
  .subscribe_tag_list {
    margin: 0 40px;
    margin-top: 50px;
    .tag {
      float: left;
      border: 1px solid rgb(207, 203, 203);
      border-radius: 5px;
      margin-right: 10px;
      margin-bottom: 15px;
      padding: 10px 0;
      span {
        font-size: 24px;
        margin: 0 20px;
      }
      .delete_subscribe_tag {
        cursor: pointer;
      }
      .delete_subscribe_tag:hover {
        color: red;
      }
    }
    .no_tag {
      font-size: 20px;
    }
  }
}
</style>