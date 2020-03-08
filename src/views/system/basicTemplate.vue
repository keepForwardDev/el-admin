<template>
  <div class="app-container">
    <div class="filter-container">
      <el-collapse-transition>
        <div>
          <div>
            <el-card class="box-card">
              <el-input v-model="search.name" clearable placeholder="请输入角色名称" size="small" maxlength="10" style="width: 135px;" class="filter-item" />
              <el-button type="primary" class="filter-item" size="small" @click="getList(true)">搜索</el-button>
            </el-card>
          </div>

          <div class="operate_btn">
            <el-button type="primary" size="small" @click="showForm">新增</el-button>
          </div>
        </div>
      </el-collapse-transition>
    </div>
    <div class="table-content" />
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogFormVisible"
      :width="dialogWidth"
    >
      <el-form ref="form" :model="formData" label-width="auto" :rules="rules">
        <el-form-item label="角色名称" prop="title">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="角色编码" prop="title">
          <el-input v-model="formData.code" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formData.description" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveForm">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { getList, saveFormData } from '@/api/system/role'
import { validNotNull, validNotCN } from '@/utils/validate'
export default {
  name: 'Role',
  data() {
    return {
      search: {
        name: ''
      },
      pager: {
        totalCount: 0,
        pageCount: 1,
        pageSize: 10,
        currentPage: 1
      },
      listLoading: false, // 表格加载动画
      list: [], // 表格数据
      dialogFormVisible: false,
      dialogTitle: '新增菜单',
      formData: {
        name: '',
        code: '',
        description: ''
      },
      rules: {
        name: validNotNull(),
        code: [{ required: true, message: '该项为必填项，请填写完整！' }, { validator: validNotCN, trigger: 'blur' }]
      }
    }
  },
  computed: {
    dialogWidth() {
      if (this.$store.state.app.device === 'mobile') {
        return '100%'
      } else {
        return '700px'
      }
    }
  },
  created() {
    this.getList(true)
  },
  methods: {
    getList(flag) {
      if (flag) {
        this.pager.currentPage = 1
      }
      const params = Object.assign({}, this.search, { pageSize: this.pager.pageSize, currentPage: this.pager.currentPage })
      getList(params).then(res => {
        if (res.code === 1) {
          this.list = res.data.list
          this.pager.totalCount = res.data.totalCount
          this.pager.pageCount = res.data.pageCount
          this.pager.pageSize = res.data.pageSize
          this.pager.currentPage = res.data.currentPage
        }
      })
    },
    showForm() {
      this.formData = {
        name: '',
        code: '',
        description: ''
      }
      this.dialogFormVisible = true
    },
    saveForm() {
      this.$refs['form'].validate((valid, object) => {
        if (!valid) {
          this.$message({
            message: '请完善相关信息填写！',
            type: 'warning'
          })
        } else {
          saveFormData(this.formData).then(res => {
            if (res.code === 1) {
              this.$message({
                message: res.msg,
                type: 'success'
              })
              this.dialogFormVisible = false
            }
          })
        }
      })
    }
  }
}
</script>
<style scoped>
</style>
