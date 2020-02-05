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
    <div class="table-content">
      <el-table
        v-loading="listLoading"
        :data="list"
        fit
        :show-overflow-tooltip="true"
        style="width: 100%"
      >
        <el-table-column
          prop="name"
          align="center"
          label="角色名称"
        />
        <el-table-column
          prop="code"
          align="center"
          label="角色编码"
        />
        <el-table-column
          prop="description"
          align="center"
          label="备注"
        />
        <el-table-column
          prop="createTime"
          align="center"
          label="创建时间"
        />
        <el-table-column
          align="center"
          label="操作"
          width="400"
        >
          <template slot-scope="{row}">
            <el-button type="primary" size="small" @click="editData(row)">编辑</el-button>
            <el-button type="primary" size="small" @click="editData(row)">查看授权人员</el-button>
            <el-button type="danger" size="small" @click="deleteData(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="el-page">
        <el-pagination
          :current-page="pager.currentPage"
          :page-sizes="pageSizes"
          :page-size="pager.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pager.totalCount"
          @size-change="getList(true)"
          @current-change="getList(true)"
        />
      </div>
    </div>
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogFormVisible"
      :width="dialogWidth"
    >
      <el-form ref="form" :model="formData" label-width="auto" :rules="rules">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
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
import { getList, saveFormData, deleteRole } from '@/api/system/role'
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
      pageSizes: [10, 20, 40, 60, 100],
      listLoading: false, // 表格加载动画
      list: [], // 表格数据
      dialogFormVisible: false,
      dialogTitle: '新增角色',
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
      this.listLoading = true
      if (flag) {
        this.pager.currentPage = 1
      }
      const params = Object.assign({}, this.search, { pageSize: this.pager.pageSize, currentPage: this.pager.currentPage })
      getList(params).then(res => {
        this.listLoading = false
        if (res.code === 1) {
          this.list = res.data.list
          this.pager.totalCount = res.data.totalCount
          this.pager.pageCount = res.data.pageCount
          this.pager.pageSize = res.data.pageSize
          this.pager.currentPage = res.data.currentPage
        }
      }).catch(_ => {
        this.listLoading = false
      })
    },
    showForm() {
      this.formData = {
        name: '',
        code: '',
        description: ''
      }
      this.dialogTitle = '新增角色'
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
    },
    editData(row) {
      this.formData = {
        name: row.name,
        code: row.code,
        description: row.description
      }
      this.dialogFormVisible = true
      this.dialogTitle = '编辑角色'
    },
    deleteData(row) {
      this.$confirm('确定删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteRole(row.id).then(res => {
          if (res.code === 1) {
            this.$message({
              message: '删除成功！',
              type: 'success'
            })
            this.getList(true)
          }
        })
      })
    }
  }
}
</script>
<style scoped>
</style>
