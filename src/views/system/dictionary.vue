<template>
  <div class="app-container">
    <el-card class="box-card">
      <!--  查询条件区                                -->
      <el-form v-model="search" :inline="true">
        <div class="filter-form" :style="{'max-height': hideFilter? 0: '500px'}">
          <el-form-item label="资源名称">
            <el-input v-model="search.name" placeholder="请输入角色名称" cl />
          </el-form-item>
          <el-form-item label="资源编码">
            <el-input v-model="search.code" placeholder="请输入资源唯一编码" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" class="filter-item" size="small" @click="getList(true)">搜索</el-button>
            <el-button class="filter-item" size="small" @click="resetQuery">重置</el-button>
          </el-form-item>
        </div>
      </el-form>
      <div
              class="block-control"
              @mouseover="selectStyle(true)"
              @mouseout="selectStyle(false)"
              @click="controlFilter"
      >
        <i :class="{'el-icon-caret-bottom': hideFilter,'el-icon-caret-top': !hideFilter ,'hovering': active}" />
        <span :class="{'hover': active}">{{ active ? filterText : '' }}</span>
      </div>

      <!--          操作按钮区                -->
      <div class="operation">
        <el-form :inline="true">
          <el-form-item>
            <el-button type="primary" size="small" @click="showForm">新增</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!--       表格区                       -->
      <div class="table-content">
        <el-table
                v-loading="listLoading"
                :header-cell-class-name="headClass"
                :data="list"
                fit
                border
                style="width: 100%"
        >
          <el-table-column
                  show-overflow-tooltip
                  prop="name"
                  align="center"
                  label="资源名称"
          >
            <template slot-scope="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column
                  prop="code"
                  align="center"
                  label="资源编码"
          />
          <el-table-column
                  prop="url"
                  align="center"
                  label="访问地址"
                  show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span>{{ scope.row.url }}</span>
            </template>
          </el-table-column>
          <el-table-column
                  show-overflow-tooltip
                  prop="description"
                  align="center"
                  label="资源描述"
          >
            <template slot-scope="scope">
              <span>{{ scope.row.description }}</span>
            </template>
          </el-table-column>
          <el-table-column
                  show-overflow-tooltip
                  prop="menuName"
                  align="center"
                  label="所属菜单"
          >
            <template slot-scope="scope">
              <span>{{ scope.row.menuName }}</span>
            </template>
          </el-table-column>
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
              <el-button type="danger" size="small" @click="deleteData(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="el-page">
          <el-pagination
                  :current-page="pager.currentPage"
                  :page-sizes="pageSizes"
                  :page-size="pager.pageSize"
                  :layout="pagerSetting"
                  :total="pager.totalCount"
                  @size-change="getList(true)"
                  @current-change="getList(true)"
          />
        </div>
      </div>
      <!--         弹窗区             -->
      <el-dialog
              :title="dialogTitle"
              :visible.sync="dialogFormVisible"
              :width="dialogWidth"
      >
        <el-form ref="form" :model="formData" label-width="auto" :rules="rules">
          <el-form-item label="资源名称" prop="name">
            <el-input v-model="formData.name" />
          </el-form-item>
          <el-form-item label="资源编码" prop="code">
            <el-input v-model="formData.code" />
          </el-form-item>
          <el-form-item label="所属菜单" prop="code">
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
    </el-card>
  </div>
</template>
<script>
import { getList, saveFormData, deleteData } from '@/api/system/resources'
import { validNotNull, validNotCN } from '@/utils/validate'
export default {
  name: 'Resources',
  filters: {
    toString(val) {
      return '' + val
    },
    iconClass(val) {
      if (val) {
        var map = {}
        map[val] = true
        return map
      }
      return {
        'el-icon-document': true
      }
    }
  },
  data() {
    return {
      search: {
        name: '',
        code: ''
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
      dialogWidth: '700px',
      pagerSetting: 'total, sizes, prev, pager, next, jumper',
      formData: { // 表单数据
        id: '',
        name: '',
        code: '',
        description: '',
        menuIds: [],
        resourceIds: []
      },
      rules: { // 表单校验规则
        name: validNotNull(),
        code: [{ required: true, message: '该项为必填项，请填写完整！' }, { validator: validNotCN, trigger: 'blur' }]
      },
      active: false,
      hideFilter: false
    }
  },
  computed: {
    filterText() {
      if (!this.hideFilter) {
        return '隐藏查询条件'
      } else {
        return '显示查询条件'
      }
    }
  },
  watch: {
    '$store.state.app.device': {
      handler(newName, oldName) {
        if (newName === 'mobile') {
          this.hideFilter = true
          this.dialogWidth = '100%'
          this.pagerSetting = 'prev, pager, next'
        } else {
          this.dialogWidth = '700px'
          this.pagerSetting = 'total, sizes, prev, pager, next, jumper'
        }
      },
      deep: true
    }
  },
  created() {
    if (this.$store.state.app.device === 'mobile') {
      this.hideFilter = true
    }
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
        id: '',
        name: '',
        code: '',
        description: '',
        menuIds: [],
        resourceIds: []
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
              this.getList(false)
              this.dialogFormVisible = false
            } else {
              this.$message({
                message: res.msg,
                type: 'warning'
              })
            }
          })
        }
      })
    },
    editData(row) {
      this.formData = {
        id: row.id,
        name: row.name,
        code: row.code,
        description: row.description,
        menuIds: row.menuIds,
        resourceIds: row.resourceIds
      }
      this.expandedNode = row.menuIds
      this.dialogFormVisible = true
      this.dialogTitle = '编辑角色'
    },
    deleteData(row) {
      this.$confirm('确定删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteData(row.id).then(res => {
          if (res.code === 1) {
            this.$message({
              message: '删除成功！',
              type: 'success'
            })
            this.getList(true)
          }
        })
      })
    },
    headClass(row, column, rowIndex, columnIndex) {
      return 'tableHead'
    },
    selectStyle(flag) {
      this.active = flag
    },
    controlFilter() {
      this.hideFilter = !this.hideFilter
    },
    resetQuery() {
      this.search = {
        name: '',
        code: ''
      }
      this.getList(true)
    }
  }
}
</script>
<style scoped>
</style>
