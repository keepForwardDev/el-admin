<template>
  <div class="app-container">
    <div class="main-content">
      <el-container style="height: 800px">
        <el-aside style="padding: 0;background: #fff;" width="asideWidth">
          <el-menu
            default-active="2"
            class="el-menu-vertical-demo"
            background-color="#545c64"
            text-color="#fff"
            active-text-color="#ffd04b"
          >
            <el-submenu index="1">
              <template slot="title">
                <i class="el-icon-location" />
                <span>导航一</span>
              </template>
              <el-menu-item-group>
                <template slot="title">分组一</template>
                <el-menu-item index="1-1">选项1</el-menu-item>
                <el-menu-item index="1-2">选项2</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group title="分组2">
                <el-menu-item index="1-3">选项3</el-menu-item>
              </el-menu-item-group>
              <el-submenu index="1-4">
                <template slot="title">选项4</template>
                <el-menu-item index="1-4-1">选项1</el-menu-item>
              </el-submenu>
            </el-submenu>
            <el-menu-item index="2">
              <i class="el-icon-menu" />
              <span slot="title">导航二</span>
            </el-menu-item>
            <el-menu-item index="3" disabled>
              <i class="el-icon-document" />
              <span slot="title">导航三</span>
            </el-menu-item>
            <el-menu-item index="4">
              <i class="el-icon-setting" />
              <span slot="title">导航四</span>
            </el-menu-item>
          </el-menu>
        </el-aside>

        <el-main>
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
              <el-input v-model="menu.meta.icon" />
            </el-form-item>
            <el-form-item label="meta(activeMenu)">
              <el-input v-model="menu.meta.activeMenu" />
            </el-form-item>
            <el-form-item label="">
              <el-checkbox v-model="menu.hidden" label="是否隐藏" border />
              <el-checkbox v-model="menu.alwaysShow" label="是否固定菜单栏" border />
              <el-checkbox v-model="menu.meta.noCache" label="meta(noCache)" border />
              <el-checkbox v-model="menu.meta.affix" label="meta(affix)" border />
              <el-checkbox v-model="menu.meta.breadcrumb" label="meta(breadcrumb)" border />
            </el-form-item>

          </el-form>
        </el-main>

      </el-container>
    </div>
  </div>
</template>

<script>
import { menuList, childMenuList, saveMenu, menuTree, deleteById } from '@/api/system/menu'
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
    collapse() {
      if (this.$store.state.app.device === 'mobile') {
        return true
      }
      return false
    },
    asideWidth() {
      if (this.$store.state.app.device === 'mobile') {
        return '60px'
      }
      return '250px'
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
    },
    deleteRow(row) {
      this.$confirm('此操作将永久删除该菜单，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteById(row.id).then(res => {
          if (res.code === 1) {
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
  .el-card {
    border: 0
  }
</style>
