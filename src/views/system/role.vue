<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-form v-model="search" :inline="true">
        <div class="filter-form" :style="{'max-height': hideFilter? 0: '500px'}">
          <el-form-item label="角色名称">
            <el-input v-model="search.name" placeholder="请输入角色名称" />
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

      <div class="operation">
        <el-form :inline="true">
          <el-form-item>
            <el-button type="primary" size="small" icon="el-icon-plus" @click="showForm">新增</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="table-content">
        <el-table
          v-loading="listLoading"
          ref="grid"
          :header-cell-class-name="headClass"
          :data="list"
          fit
          border
          style="width: 100%"
          :default-sort="defaultSort"
          @sort-change="sortChange"
        >
          <el-table-column
            prop="id"
            align="center"
            label="ID"
          />
          <el-table-column
            show-overflow-tooltip
            prop="name"
            align="center"
            label="角色名称"
          >
            <template slot-scope="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
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
            sortable="custom"
          />
          <el-table-column
            align="center"
            label="操作"
            width="400"
          >
            <template slot-scope="{row}">
              <el-button type="primary" size="small" @click="editData(row, '授权菜单', true, false)">授权菜单</el-button>
              <el-button type="primary" size="small" @click="editData(row, '授权资源', false, true)">授权资源</el-button>
              <el-button type="primary" size="small" @click="editData(row, '编辑角色', true, true)">编辑</el-button>
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
      <el-dialog
        :title="dialogTitle"
        :visible.sync="dialogFormVisible"
        :width="dialogWidth"
      >
        <el-form ref="form" :model="formData" label-width="auto" :rules="rules">
          <el-form-item v-if="seeMenu && seeResource" label="角色名称" prop="name">
            <el-input v-model="formData.name" />
          </el-form-item>
          <el-form-item v-show="seeMenu && seeResource" label="角色编码" prop="code">
            <el-input v-model="formData.code" />
          </el-form-item>
          <el-form-item v-show="seeMenu && seeResource" label="备注">
            <el-input v-model="formData.description" />
          </el-form-item>

          <el-form-item v-show="seeMenu" label="菜单权限">
            <el-tree
              ref="groupTree"
              accordion
              :default-expanded-keys="expandedNode"
              highlight-current
              show-checkbox
              :data="treeList"
              node-key="id"
              @check="checkChange"
            >
              <span slot-scope="{ node, data }" class="custom-tree-node">
                <span><i :class="data.extra | iconClass" />{{ node.label }}</span>
              </span>
            </el-tree>
          </el-form-item>
          <el-form-item v-show="seeResource" label="菜单资源">
            <el-cascader
              ref="resourceCascader"
              v-model="formData.cascaderValue"
              style="width: 100%"
              filterable
              :show-all-levels="false"
              :options="resourceList"
              :props="treeProps"
              size="mini"
              collapse-tags
              clearable
            />
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
import { getList, saveFormData, deleteRole } from '@/api/system/role'
import { menuTree } from '@/api/system/menu'
import { menuResource } from '@/api/system/resources'
import { validNotNull, validNotCN } from '@/utils/validate'
export default {
  name: 'Role',
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
        id: '',
        name: '',
        code: '',
        description: '',
        menuIds: [],
        resourceIds: [],
        cascaderValue: []
      },
      rules: {
        name: validNotNull(),
        code: [{ required: true, message: '该项为必填项，请填写完整！' }, { validator: validNotCN, trigger: 'blur' }]
      },
      defaultSort: {
        prop: 'createTime',
        order: 'descending'
      },
      dialogWidth: '700px',
      pagerSetting: 'total, sizes, prev, pager, next, jumper',
      active: false,
      hideFilter: false,
      expandedNode: [],
      treeList: [],
      treeProps: {
        multiple: true,
        value: 'id'
        /* lazy: true,
        lazyLoad: (node, resolve) => {
          if (node.data.hasChildren) {
            childMenuList(node.value).then(res => {
              if (res.code === 1) {
                const result = res.data.map(item => {
                  return {
                    label: item.title,
                    value: item.id,
                    hasChildren: item.hasChildren
                  }
                })
                resolve(result)
              }
            })
          } else {
            if (node.data.leaf) {
              resolve([])
              return
            }
            menuResource(node.value).then(res => {
              if (res.code === 1) {
                const result = res.data.map(item => {
                  item.leaf = true
                  return item
                })
                resolve(result)
              }
            })
          }
        }*/
      },
      resourceList: [],
      seeMenu: true,
      seeResource: true
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
    this.menuTreeList()
    this.getMenuResource()
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
        resourceIds: [],
        cascaderValue: []
      }
      this.seeMenu = true
      this.seeResource = true
      setTimeout(() => {
        this.$refs['groupTree'].setCheckedKeys([], false)
      }, 1000)
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
          const node = this.$refs.resourceCascader.getCheckedNodes(true)
          this.formData.resourceIds = node.map(item => item.value)
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
    editData(row, title, seeMenu, seeResource) {
      this.formData = {
        id: row.id,
        name: row.name,
        code: row.code,
        description: row.description,
        menuIds: row.menuIds,
        resourceIds: row.resourceIds,
        cascaderValue: row.cascaderValue
      }
      this.expandedNode = row.menuIds
      this.dialogFormVisible = true
      this.dialogTitle = title
      this.seeMenu = seeMenu
      this.seeResource = seeResource
      setTimeout(() => {
        this.$refs['groupTree'].setCheckedKeys([], false)
        this.formData.menuIds.forEach(r => {
          this.$refs['groupTree'].setChecked(r, true, false)
        }, 1000)
      })
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
    menuTreeList() {
      menuTree().then(res => {
        if (res.code === 1) {
          this.treeList = res.data
        }
      })
    },
    checkChange(v1, v2, v3, v4) {
      const checkNode = v2.checkedKeys
      const halfCheckNode = v2.halfCheckedKeys
      this.formData.menuIds = [...checkNode, ...halfCheckNode]
    },
    resetQuery() {
      this.search = {}
      this.$refs.grid.clearSort()
      this.getList(true)
    },
    getMenuResource() {
      menuResource().then(res => {
        if (res.code === 1) {
          this.resourceList = res.data
        }
      })
    },
    sortChange(field) {
      if (field.order) {
        this.search.orderWay = field.order
        this.search.orderField = field.prop
        this.getList(true)
      }
    }
  }
}
</script>
<style scoped>
</style>
