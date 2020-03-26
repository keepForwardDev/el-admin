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
              <el-form-item label="字典名称">
                <el-input v-model="search.name" placeholder="请输入字典名称" />
              </el-form-item>
              <el-form-item label="所属父级" v-if="$store.state.app.device == 'mobile'">
                <el-select v-model="search.parentId" placeholder="请选择" style="width: 100%" clearable>
                  <el-option
                          v-for="item in treeList"
                          :key="item.id"
                          :label="item.label"
                          :value="item.id"
                  />
                </el-select>
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
                <el-button type="primary" size="small" @click="showForm"  icon="el-icon-plus">新增</el-button>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" size="small" icon="el-icon-delete" :disabled="selection.length === 0" @click="deleteData()">批量删除</el-button>
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
                    @selection-change="handleSelectionChange"
                    style="width: 100%"
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
                      show-overflow-tooltip
                      prop="description"
                      align="center"
                      label="备注"
              >
                <template slot-scope="scope">
                  <span>{{ scope.row.description }}</span>
                </template>
              </el-table-column>
              <el-table-column
                      prop="sort"
                      align="center"
                      label="排序值"
              />
              <el-table-column
                      show-overflow-tooltip
                      prop="enabled"
                      align="center"
                      label="状态"
              >
                <template slot-scope="scope">
                  <span>{{ scope.row.enabled ? '启用' : '禁用' }}</span>
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
                      width="250"
              >
                <template slot-scope="{row}">
                  <el-button type="primary" size="small" @click="editData(row)">编辑</el-button>
                  <el-button type="primary" size="small" @click="enableRow(row, true)" v-if="!row.enabled">启用</el-button>
                  <el-button size="small" @click="enableRow(row, false)" v-if="row.enabled">禁用</el-button>
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
              <el-form-item label="名称" prop="name">
                <el-input v-model="formData.name" />
              </el-form-item>
              <el-form-item label="所属父级" v-if="selectName">
                <span>{{selectName}}</span>
              </el-form-item>
              <el-form-item label="字典编码" prop="code" v-if="!selectName">
                <el-input v-model="formData.code" />
              </el-form-item>
              <el-form-item label="备注">
                <el-input v-model="formData.description" />
              </el-form-item>
              <el-form-item label="排序号">
                <el-input v-model="formData.sort" type="number"/>
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
import { getList, getRootList, saveFormData, deleteData, enabledDictionary } from '@/api/system/dictionary'
import { validNotNull, validNotCN } from '@/utils/validate'
export default {
  name: 'dictionary',
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
        parentId: ''
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
      treeList: [],
      dialogFormVisible: false,
      dialogTitle: '新增字典',
      dialogWidth: '700px',
      pagerSetting: 'total, sizes, prev, pager, next, jumper',
      formData: { // 表单数据
        id: '',
        name: '',
        code: '',
        description: '',
        sort: 0,
        parentId: ''
      },
      rules: { // 表单校验规则
        name: validNotNull(),
        code: [{ required: true, message: '该项为必填项，请填写完整！' }, { validator: validNotCN, trigger: 'blur' }]
      },
      active: false,
      hideFilter: false,
      defaultSort: {
        prop: 'createTime',
        order: 'descending'
      },
      selection: [],
      selectName: '',
      treeFilterText: ''
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
    this.rootTreeList()
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
        parentId: this.search.parentId,
        sort: 0
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
        parentId: row.parentId,
        sort: row.sort
      }
      this.expandedNode = row.menuIds
      this.dialogFormVisible = true
      this.dialogTitle = '编辑角色'
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
        deleteData(selection, this.search.parentId).then(res => {
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
      if (this.selectName) {
        this.$refs.leftTree.setCurrentKey(null)
        this.search.parentId = ''
      }
      this.selectName = ''
      this.$refs.grid.clearSort()
      this.getList(true)
    },
    sortChange(field) {
      if (field.order) {
        this.search.orderWay = field.order
        this.search.orderField = field.prop
        this.getList(true)
      }
    },
    handleSelectionChange(val) {
      if (val.length > 0) {
        this.selection = val.map(item => item.id)
      } else {
        this.selection = []
      }
    },
    selectFilterNode(node) {
      this.formData.parentId = node.id
      this.search.parentId = node.id
      this.selectName = node.label
      this.getList(true)
    },
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    rootTreeList() {
      getRootList().then(res => {
        if (res.code === 1) {
          this.treeList = res.data
        }
      })
    },
    enableRow(row, flag) {
      const tips = flag ? '启用' : '禁用'
      this.$confirm(`确定${tips}吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        enabledDictionary(row.id, flag).then(res => {
          if (res.code === 1) {
            this.getList(true)
            this.$message({
              type: 'success',
              message: res.msg
            })
          }
        })
      })
    }
  }
}
</script>
<style scoped>
  .el-main {
    padding: 0;
  }
</style>
