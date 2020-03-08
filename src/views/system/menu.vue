<template>
  <div class="app-container">
    <div class="filter-container">
      <el-collapse-transition>
        <div>
          <div>
            <el-card class="box-card">
              <el-input v-model="search.name" clearable placeholder="请输入菜单名称" size="small" maxlength="10" style="width: 135px;" class="filter-item" />
              <el-button type="primary" class="filter-item" size="small">搜索</el-button>
            </el-card>
          </div>

          <div class="operate_btn">
            <el-button type="primary" size="small" @click="addMenu">新增</el-button>
          </div>
        </div>
      </el-collapse-transition>
    </div>
    <div class="table-content">
      <el-table
        key="id"
        v-loading="listLoading"
        :data="list"
        border
        fit
        lazy
        :load="loadChildren"
        :show-overflow-tooltip="true"
        :header-cell-class-name="headClass"
        style="width: 100%;"
        row-key="id"
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      >
        <el-table-column
          type="selection"
          width="55"
        />
        <el-table-column
          align="center"
          prop="title"
          label="名称"
        />
        <el-table-column
          align="center"
          prop="path"
          label="访问地址"
        />
        <el-table-column
          align="center"
          prop="component"
          label="组件地址"
        />
        <el-table-column
          align="center"
          prop="name"
          label="router-name"
        />
        <el-table-column
          align="center"
          prop="meta"
          label="meta"
        />
        <el-table-column
          align="center"
          prop="meta"
          label="操作"
        >
          <template slot-scope="{row}">
            <el-button type="primary" size="small" @click="editMenu(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogFormVisible"
      :width="dialogWidth"
    >
      <el-form ref="form" :model="menu" label-width="auto" :rules="rules">
        <el-form-item label="菜单名称" prop="title">
          <el-input v-model="menu.title" />
        </el-form-item>
        <el-form-item label="路由名称" prop="name">
          <el-input v-model="menu.name" />
        </el-form-item>
        <el-form-item label="访问地址" prop="path">
          <el-input v-model="menu.path" />
        </el-form-item>
        <el-form-item label="组件地址" prop="component">
          <el-input v-model="menu.component" />
        </el-form-item>
        <el-form-item label="所属父级">
          <el-tree
            ref="groupTree"
            :data="treeList"
            show-checkbox
            node-key="id"
            :default-expanded-keys="expandNode"
            :default-checked-keys="checkedNode"
          />
        </el-form-item>
        <el-form-item label="排序号">
          <el-input v-model="menu.sort" type="number" />
        </el-form-item>
        <el-form-item label="重定向地址">
          <el-input v-model="menu.redirect" />
        </el-form-item>
        <el-form-item label="meta(icon)">
          <el-input v-model="meta.icon" />
        </el-form-item>
        <el-form-item label="meta(activeMenu)">
          <el-input v-model="meta.activeMenu" />
        </el-form-item>
        <el-form-item label="是否隐藏">
          <el-switch
            v-model="menu.hidden"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />
        </el-form-item>
        <el-form-item label="是否固定菜单栏">
          <el-switch
            v-model="menu.alwaysShow"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />
        </el-form-item>
        <el-form-item label="meta(noCache)">
          <el-switch
                  v-model="menu.meta.noCache"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
          />
        </el-form-item>
        <el-form-item label="meta(affix)">
          <el-switch
                  v-model="menu.meta.affix"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
          />
        </el-form-item>
        <el-form-item label="meta(breadcrumb)">
          <el-switch
                  v-model="menu.meta.breadcrumb"
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
  </div>
</template>

<script>
import { menuList, childMenuList, saveMenu, menuTree } from '@/api/system/menu'
import { validNotNull, validNotCN } from '@/utils/validate'
export default {
  name: 'MenuComponent',
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
      list: [],
      dialogFormVisible: false,
      menu: {
        title: '',
        name: '',
        path: '',
        component: '',
        sort: 0,
        hidden: false,
        alwaysShow: false,
        redirect: '',
        meta: {
          title: '',
          icon: '',
          noCache: false,
          affix: false,
          breadcrumb: false,
          activeMenu: ''
        }
      },
      dialogTitle: '新增菜单',
      rules: {
        title: validNotNull(),
        name: [{ required: true, message: '该项为必填项，请填写完整！' }, { validator: validNotCN, trigger: 'blur' }],
        path: validNotNull(),
        component: validNotNull()
      },
      treeList: [],
      checkedNode: [],
      expandNode: []
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
    this.getList()
    this.menuList()
  },
  methods: {
    getList() {
      const params = Object.assign({}, this.search, { pageSize: this.pager.pageSize, currentPage: this.pager.currentPage })
      menuList(params).then(res => {
        if (res.code === 1) {
          this.list = res.data.list
          this.pager.totalCount = res.data.totalCount
          this.pager.pageCount = res.data.pageCount
          this.pager.pageSize = res.data.pageSize
          this.pager.currentPage = res.data.currentPage
        }
      })
    },
    headClass(row, column, rowIndex, columnIndex) {
      return 'tableHead'
    },
    loadChildren(tree, treeNode, resolve) {
      childMenuList(tree.id).then(res => {
        if (res.code === 1) {
          resolve(res.data)
        }
      })
    },
    addMenu() {
      this.menu = {
        id: '',
        title: '',
        name: '',
        path: '',
        parentId: 0,
        component: '',
        sort: 0,
        hidden: false,
        alwaysShow: false,
        redirect: '',
        meta: {
          title: '',
          icon: '',
          noCache: false,
          affix: false,
          breadcrumb: false,
          activeMenu: ''
        }
      }
      this.dialogFormVisible = true
    },
    editMenu(row) {
      this.menu = {
        id: row.id,
        title: row.title,
        name: row.name,
        path: row.path,
        parentId: row.parentId,
        component: row.component,
        sort: row.sort,
        hidden: row.hidden,
        alwaysShow: row.alwaysShow,
        redirect: row.redirect,
        meta: row.meta
      }
      this.dialogFormVisible = true
      this.checkedNode = [row.parentId]
      // this.$refs['groupTree'].setChecked(row.parentId, true, false)
    },
    saveForm() {
      this.$refs['form'].validate((valid, object) => {
        if (!valid) {
          this.$message({
            message: '请完善相关信息填写！',
            type: 'warning'
          })
        } else {
          saveMenu(this.menu).then(res => {
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
    menuList() {
      menuTree().then(res => {
        if (res.code === 1) {
          this.treeList = res.data
        }
      })
    }
  }
}
</script>
<style scoped>
  .el-card {
    border: 0
  }
</style>
