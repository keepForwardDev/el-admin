<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-container>
        <el-aside style="padding: 0;margin-right:20px;background: #fff;" width="300px" v-if="$store.state.app.device !== 'mobile'">
          <div class="el-tips">
              <span class="el-tips-icon">
                <i class="el-icon-info" />
              </span>
            <span>当前选中的节点：<span style="color: #4A9FF9">{{selectName}}</span></span>
          </div>

          <div style="padding-top: 10px;padding-bottom: 10px">
            <el-input
                    v-model="treeFilterText"
                    placeholder="请输入内容"
            >
              <i slot="suffix" class="el-input__icon el-icon-search" />
            </el-input>
          </div>

          <el-tree
                  ref="leftTree"
                  node-key="id"
                  :data="treeList"
                  :filter-node-method="filterNode"
                  accordion
                  :expand-on-click-node="false"
                  default-expand-all
                  highlight-current
                  @node-click="selectFilterNode"
          >
            <span  slot-scope="{ node }">
              <span :title="node.label" class="el-tree-node__label">{{ node.label }}</span>
            </span>
          </el-tree>
        </el-aside>

        <el-main>
          <!--  查询条件区                                -->
          <el-form v-model="search" :inline="true">
            <div class="filter-form" :style="{'max-height': hideFilter? 0: '500px'}">
              <el-form-item>
                <el-input v-model="keyword" placeholder="请输入关键字">
                  <el-select slot="prepend" v-model="keywordType" placeholder="请选择" style="width: 100px">
                    <el-option v-for="item in keywordTypeOptions" :key="item.field" :label="item.label" :value="item.field" />
                  </el-select>
                </el-input>
              </el-form-item>

              <el-form-item label="所属角色">
                <el-select v-model="search.roleId" filterable placeholder="请选择" style="width: 100%">
                  <el-option
                          v-for="item in roleOptions"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="所属部门" v-if="$store.state.app.device == 'mobile'">
                <el-cascader
                        popper-class="mobileCascader"
                        ref="departmentCascader"
                        v-model="deptValue"
                        style="width: 100%"
                        filterable
                        :options="treeList"
                        :props="cascaderProps"
                        clearable
                >
                  <template slot-scope="{ node, data }">
                    <span :title="data.label">{{ data.label }}</span>
                  </template>
                </el-cascader>
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
                <el-button type="primary" size="small" icon="el-icon-plus" @click="showForm">新增</el-button>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" size="small" icon="el-icon-delete" :disabled="selection.length === 0" @click="deleteData()">批量删除</el-button>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" size="small" icon="el-icon-refresh" :disabled="selection.length === 0" @click="resetPassword">密码重置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <!--       表格区                       -->
          <div class="table-content">
            <el-table
                    ref="grid"
                    v-loading="listLoading"
                    :header-cell-class-name="headClass"
                    :data="list"
                    fit
                    border
                    style="width: 100%"
                    @selection-change="handleSelectionChange"
                    :default-sort="defaultSort"
                    @sort-change="sortChange"
            >
              <el-table-column
                      type="selection"
                      width="55"
              />
              <el-table-column
                      show-overflow-tooltip
                      prop="name"
                      align="center"
                      label="名称"
              >
                <template slot-scope="scope">
                  <span>{{ scope.row.name }}</span>
                </template>
              </el-table-column>
              <el-table-column
                      prop="avatar"
                      align="center"
                      label="头像"
              >
                <template slot-scope="scope">
                  <el-avatar v-if="scope.row.avatar" size="medium" :src="scope.row.avatar" />
                </template>
              </el-table-column>
              <el-table-column
                      prop="deptName"
                      align="center"
                      label="所属部门"
                      show-overflow-tooltip
              >
                <template slot-scope="scope">
                  <span>{{ scope.row.deptName }}</span>
                </template>
              </el-table-column>
              <el-table-column
                      show-overflow-tooltip
                      prop="phone"
                      align="center"
                      label="手机"
              >
                <template slot-scope="scope">
                  <span>{{ scope.row.phone }}</span>
                </template>
              </el-table-column>
              <el-table-column
                      show-overflow-tooltip
                      prop="email"
                      align="center"
                      label="邮箱"
              >
                <template slot-scope="scope">
                  <span>{{ scope.row.email }}</span>
                </template>
              </el-table-column>
              <el-table-column
                      prop="sex"
                      align="center"
                      label="性别"
              >
                <template slot-scope="scope">
                  <span>{{ scope.row.sex | convertSex }}</span>
                </template>
              </el-table-column>
              <el-table-column
                      prop="enabled"
                      align="center"
                      label="状态"
              >
                <template slot-scope="scope">
                  <span>{{ scope.row.enabled | convertEnabled }}</span>
                </template>
              </el-table-column>
              <el-table-column
                      prop="createTime"
                      align="center"
                      label="创建时间"
                      sortable="custom"
              />
              <el-table-column
                      align="center"
                      label="操作"
                      width="200"
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
              <el-form-item label="用户名称" prop="name">
                <el-input v-model="formData.name" />
              </el-form-item>
              <el-form-item label="所属部门">
                <el-tree
                        ref="groupTree1"
                        :expand-on-click-node="false"
                        node-key="id"
                        :data="treeList"
                        :default-expanded-keys="expandedNode"
                        accordion
                        highlight-current
                        @node-click="selectNode"
                />
              </el-form-item>
              <el-form-item label="所属角色">
                <el-select v-model="role" multiple filterable placeholder="请选择" style="width: 100%" @change="roleSelectChange">
                  <el-option
                          v-for="item in roleOptions"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="手机号" prop="phone">
                <el-input v-model="formData.phone" />
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="formData.email" />
              </el-form-item>
              <el-form-item label="职务">
                <el-input v-model="formData.duty" />
              </el-form-item>
              <el-form-item label="出生日期">
                <el-date-picker
                        v-model="formData.birthday"
                        value-format="yyyy-MM-dd"
                        type="date"
                        placeholder="选择日期"
                />
              </el-form-item>
              <el-form-item label="性别">
                <el-radio v-model="formData.sex" :label="1">男</el-radio>
                <el-radio v-model="formData.sex" :label="2">女</el-radio>
              </el-form-item>
              <el-form-item label="头像">
                <el-row>
                  <el-col v-if="formData.avatar" :span="2">
                    <el-avatar size="medium" :src="formData.avatar" />
                  </el-col>
                  <el-col :span="2">
                    <el-upload
                            :show-file-list="false"
                            :action="uploadUrl()"
                            :on-success="uploadSuccess"
                            :on-error="uploadError"
                    >
                      <el-button size="small" type="primary">点击上传</el-button>
                    </el-upload>
                  </el-col>
                </el-row>
              </el-form-item>
              <el-form-item label="是否启用">
                <el-switch
                        v-model="formData.enabled"
                        :active-value="1"
                        :inactive-value="0"
                        active-color="#13ce66"
                        inactive-color="#ff4949"
                />
              </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveForm">保存</el-button>
        </span>
          </el-dialog>
        </el-main>
      </el-container>
    </el-card>
  </div>
</template>
<script>
import { deleteData, getList, saveFormData, resetPassword } from '@/api/system/user'
import { treeList } from '@/api/system/department'
import { roleLabelNodes } from '@/api/system/role'
import { validNotNull } from '@/utils/validate'
export default {
  name: 'User',
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
    },
    convertSex(val) {
      if (val === 2) {
        return '女'
      } else {
        return '男'
      }
    },
    convertEnabled(val) {
      if (val === 0) {
        return '禁用'
      } else {
        return '启用'
      }
    }
  },
  data() {
    const customValidator = (rule, value, callback) => {
      if (this.value) {
        callback()
        return
      }
      if (this.formData.email || this.formData.phone) {
        callback()
      } else {
        callback(new Error('邮箱和手机二者需填一个作为登录账号！'))
      }
    }
    return {
      search: {},
      pager: {
        totalCount: 0,
        pageCount: 1,
        pageSize: 10,
        currentPage: 1
      },
      pageSizes: [10, 20, 40, 60, 100],
      listLoading: false, // 表格加载动画
      list: [], // 表格数据
      defaultSort: {
        prop: 'createTime',
        order: 'descending'
      },
      dialogFormVisible: false,
      dialogTitle: '新增用户',
      formData: { // 表单数据
        id: '',
        name: '',
        deptId: '',
        role: [],
        phone: '',
        email: '',
        duty: '',
        birthday: null,
        sex: 1,
        avatar: '',
        enabled: 1
      },
      rules: { // 表单校验规则
        name: validNotNull(),
        email: [
          { validator: customValidator, trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ],
        phone: [{ validator: customValidator, trigger: 'blur' }]
      },
      dialogWidth: '700px',
      pagerSetting: 'total, sizes, prev, pager, next, jumper',
      selection: [],
      active: false,
      hideFilter: false,
      keywordType: 'name',
      keyword: '',
      keywordTypeOptions: [
        {
          label: '名称',
          field: 'name'
        },
        {
          label: '手机号',
          field: 'phone'
        },
        {
          label: '电子邮箱',
          field: 'email'
        }
      ],
      treeList: [],
      roleOptions: [],
      role: [],
      searchRole: '',
      expandedNode: [],
      cascaderProps: {
        value: 'id',
        checkStrictly: true
      },
      deptValue: [],
      treeFilterText: '',
      selectName: ''
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
    },
    treeFilterText(val, oldVal) {
      this.$refs.leftTree.filter(val)
    }
  },
  created() {
    if (this.$store.state.app.device === 'mobile') {
      this.hideFilter = true
    }
    this.getList(true)
    this.departmentTree()
    this.getRoleOptions()
  },
  methods: {
    getList(flag) {
      this.listLoading = true
      if (flag) {
        this.pager.currentPage = 1
      }
      const params = Object.assign({}, this.search, { pageSize: this.pager.pageSize, currentPage: this.pager.currentPage })
      params[this.keywordType] = this.keyword
      if (this.deptValue.length > 0) {
        params.deptId = this.deptValue[this.deptValue.length - 1]
      }
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
        deptId: '',
        role: [],
        phone: '',
        email: '',
        duty: '',
        birthday: null,
        sex: 1,
        avatar: '',
        enabled: 1
      }
      this.dialogTitle = '新增用户'
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
        deptId: row.deptId,
        role: row.role,
        phone: row.phone,
        email: row.email,
        duty: row.duty,
        birthday: row.birthday,
        sex: row.sex,
        avatar: row.avatar,
        enabled: row.enabled
      }
      if (row.deptId) {
        setTimeout(() => {
          this.$refs['groupTree1'].setCurrentKey(row.deptId)
        }, 1000)
        this.expandedNode = [row.deptId]
      }
      if (row.role) {
        this.role = row.role.map(item => {
          return item.value
        })
      }
      this.dialogFormVisible = true
      this.dialogTitle = '编辑用户'
    },
    deleteData(row) {
      let selection = []
      if (row) {
        selection.push(row.id)
      } else {
        selection = this.selection
      }
      this.$confirm('确定删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteData(selection).then(res => {
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
      this.search = {}
      this.keyword = ''
      this.keywordType = 'name'
      this.$refs.grid.clearSort()
      if (this.$refs.leftTree && this.deptValue.length > 0) {
        this.$refs.leftTree.setCurrentKey(null)
        this.deptValue = []
      }
      this.selectName = ''
      this.getList(true)
    },
    handleSelectionChange(val) {
      if (val.length > 0) {
        this.selection = val.map(item => item.id)
      } else {
        this.selection = []
      }
    },
    uploadSuccess(response, file, fileList) {
      this.formData.avatar = response.data
    },
    uploadError(e, file, fileList) {
      this.$message({
        message: '网络错误，请稍后重试！',
        type: 'error'
      })
    },
    departmentTree() {
      treeList().then(res => {
        if (res.code === 1) {
          this.treeList = res.data
        }
      })
    },
    selectNode(node) {
      this.formData.deptId = node.id
    },
    getRoleOptions() {
      roleLabelNodes().then(res => {
        if (res.code === 1) {
          this.roleOptions = res.data
        }
      })
    },
    roleSelectChange(val) {
      const array = []
      val.forEach(v => {
        array.push({
          value: v
        })
      })
      this.formData.role = array
    },
    selectFilterNode(node) {
      this.deptValue = [node.id]
      this.selectName = node.label
      this.getList(true)
    },
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    resetPassword() {
      this.$confirm('确定重置吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        resetPassword(this.selection).then(res => {
          if (res.code === 1) {
            this.$alert('密码已重置为：<span style="color: red">' + res.data + '</span> 请牢记！', '重置成功', {
              dangerouslyUseHTMLString: true
            })
          }
        })
      })
    },
    sortChange(field) {
      this.search.orderWay = field.order
      this.search.orderField = field.prop
      this.getList(true)
    }
  }
}
</script>
<style scoped>
  .el-main {
    padding: 0;
  }

  .el-cascader-menu {
    max-width: 10px;
  }
</style>
