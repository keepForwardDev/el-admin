<template>
  <div class="app-container">
    <el-card class="box-card" style="bottom: 0">
    <div class="main-content">
      <el-container>
        <el-main>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteRow">删除</el-button>
          <el-divider></el-divider>
        </el-main>
      </el-container>
      <el-container style="height: 800px">
        <el-aside style="padding: 0;background: #fff;" :width="asideWidth">
          <div :style="{width: asideWidth}" class="el-tips">
            <span class="el-tips-icon"><i class="el-icon-info"></i></span>
            <span>当前选中的节点：<span style="color: #4A9FF9">{{selectName}}</span></span>
          </div>
          <el-menu default-active="1-4-1" class="el-menu-vertical-demo" :collapse="collapse" @select="handleSelect">
            <div v-for="firstLevel in treeList" :key="firstLevel.id">
              <el-menu-item :index="firstLevel.id | toString" v-if="firstLevel.children.length == 0">{{firstLevel.label}}</el-menu-item>
              <el-submenu :index="firstLevel.id | toString"  v-else>
                <template slot="title">
                  <i :class="firstLevel.extra" @click="handleSelect(firstLevel.id)"></i>
                  <span @click="handleSelect(firstLevel.id)">{{firstLevel.label}}</span>
                </template>
                <div v-for="secondLevel in firstLevel.children" :key="secondLevel.id">
                  <el-menu-item :index="secondLevel.id | toString" v-if="secondLevel.children.length == 0">{{secondLevel.label}}</el-menu-item>
                  <el-submenu :index="secondLevel.id | toString" v-else>
                    <template slot="title">
                      <div @click="handleSelect(secondLevel.id)">
                        <i :class="secondLevel.extra"></i>
                        <span slot="title">{{secondLevel.label}}</span>
                      </div>
                    </template>
                    <el-menu-item :index="thirdLevel.id | toString" v-for="thirdLevel in secondLevel.children" :key="thirdLevel.id">{{thirdLevel.label}}</el-menu-item>
                  </el-submenu>
                </div>
              </el-submenu>
            </div>
          </el-menu>
        </el-aside>

        <el-main>
          <el-form ref="form" :model="menu" label-width="120px" size="mini" :rules="rules">
            <el-form-item label="菜单名称" prop="title">
              <el-input v-model="menu.title" size="mini" :style="{width: inputWidth}"/>
            </el-form-item>
            <el-form-item label="路由名称" prop="name">
              <el-input v-model="menu.name" :style="{width: inputWidth}"/>
            </el-form-item>
            <el-form-item label="访问地址" prop="path">
              <el-input v-model="menu.path" :style="{width: inputWidth}"/>
            </el-form-item>
            <el-form-item label="组件地址" prop="component">
              <el-input v-model="menu.component" :style="{width: inputWidth}"/>
            </el-form-item>
            <el-form-item label="所属父级">
              <el-tree
                accordion
                check-strictly
                :default-expanded-keys="expandedNode"
                highlight-current
                :style="{width: inputWidth}"
                show-checkbox
                ref="groupTree"
                :data="treeList"
                node-key="id"
                @check="checkChange"
              />
            </el-form-item>
            <el-form-item label="排序号">
              <el-input v-model="menu.sort" type="number" :style="{width: inputWidth}"/>
            </el-form-item>
            <el-form-item label="重定向地址">
              <el-input v-model="menu.redirect" :style="{width: inputWidth}"/>
            </el-form-item>
            <el-form-item label="meta(icon)">
              <el-input v-model="menu.meta.icon" :style="{width: inputWidth}"/>
            </el-form-item>
            <el-form-item label="meta(activeMenu)">
              <el-input v-model="menu.meta.activeMenu" :style="{width: inputWidth}"/>
            </el-form-item>
            <el-form-item label="">
              <el-checkbox v-model="menu.hidden" label="是否隐藏" border />
              <el-checkbox v-model="menu.alwaysShow" label="是否固定菜单栏" border />
              <el-checkbox v-model="menu.meta.noCache" label="meta(noCache)" border />
              <el-checkbox v-model="menu.meta.affix" label="meta(affix)" border />
              <el-checkbox v-model="menu.meta.breadcrumb" label="meta(breadcrumb)" border />
            </el-form-item>
            <el-form-item label="">
              <el-button type="primary" icon="el-icon-edit" @click="saveForm">保存</el-button>
              <el-button  @click="clearForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-main>

      </el-container>
    </div>
    </el-card>
  </div>
</template>

<script>
import { menuList, childMenuList, saveMenu, menuTree, deleteById, menuInfo } from '@/api/system/menu'
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
        id: '',
        title: '', // 菜单名称
        name: '', // 路由名称
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
      },
      dialogTitle: '新增菜单',
      rules: {
        title: validNotNull(),
        name: [{ required: true, message: '该项为必填项，请填写完整！' }, { validator: validNotCN, trigger: 'blur' }],
        path: validNotNull(),
        component: validNotNull()
      },
      treeList: [],
      selectId: '',
      selectName: '',
      checkId: '',
      expandedNode: []
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
        return '65px'
      }
      return '250px'
    },
    inputWidth() {
      if (this.$store.state.app.device === 'mobile') {
        return 'auto'
      }
      return '300px'
    }
  },
  filters: {
    toString(val) {
      return '' + val
    }
  },
  created() {
    this.menuTreeList()
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
    clearForm() {
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
      this.selectName = ''
      this.expandedNode = []
      this.selectId = ''
      if (this.checkId) {
        this.$refs['groupTree'].setChecked(this.checkId, false, false)
        this.checkId = ''
      }
    },
    menuTreeList() {
      menuTree().then(res => {
        if (res.code === 1) {
          this.treeList = res.data
        }
      })
    },
    deleteRow() {
      if (!this.selectId) {
        this.$message({
          type: 'warning',
          message: '请先选择一个删除的菜单！'
        })
        return
      }
      this.$confirm('此操作将永久删除该菜单，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteById(this.selectId).then(res => {
          if (res.code === 1) {
            this.$message({
              type: 'success',
              message: res.msg
            })
          }
        })
      })
    },
    handleSelect(index) {
      this.selectId = index
      menuInfo(index).then(res => {
        if (res.code === 1) {
          const row = res.data
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
          this.selectName = row.title
          if (this.checkId) {
            this.$refs['groupTree'].setChecked(this.checkId, false, false)
          }
          if (row.parentId) {
            this.checkId = row.parentId
            this.$refs['groupTree'].setChecked(this.checkId, true, false)
            this.expandedNode = [row.parentId]
          }
        }
      })
    },
    checkChange(v1, v2, v3, v4) {
      if (this.checkId) {
        this.$refs['groupTree'].setChecked(this.checkId, false, false)
      }
      if (v2.checkedKeys.length > 0) {
        this.checkId = v1.id
        this.menu.parentId = v1.id
      } else {
        this.checkId = 0
        this.menu.parentId = 0
      }
      if (this.selectId && (this.selectId == this.checkId)) {
        this.$message({
          type: 'warning',
          message: '该节点不能被选择！'
        })
        this.$refs['groupTree'].setChecked(this.checkId, false, false)
      }
    }
  }
}
</script>
<style scoped>

  .app-container .el-card__body {
    padding: 0!important;
  }

  .el-checkbox.is-bordered+.el-checkbox.is-bordered {
    margin-left: 0;
  }
</style>
