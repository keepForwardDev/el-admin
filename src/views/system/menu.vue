<template>
  <div class="app-container">
    <div class="filter-container">
      <el-collapse-transition>
        <div>
          <div>
            <el-card class="box-card">
              <el-input clearable placeholder="请输入菜单名称" v-model="search.name" size="small" maxlength="10" style="width: 135px;" class="filter-item"></el-input>
              <el-input clearable placeholder="请输入菜单名称" v-model="search.name" size="small" maxlength="10" style="width: 135px;" class="filter-item"></el-input>
              <el-button type="primary" class="filter-item" size="small">搜索</el-button>
            </el-card>
          </div>

          <div class="operate_btn">
            <el-button type="primary"  size="small" @click="addMenu">新增</el-button>
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
                width="55">
        </el-table-column>
        <el-table-column
                align="center"
                prop="title"
                label="名称">
        </el-table-column>
        <el-table-column
                align="center"
                prop="path"
                label="访问地址">
        </el-table-column>
        <el-table-column
                align="center"
                prop="component"
                label="组件地址">
        </el-table-column>
        <el-table-column
                align="center"
                prop="name"
                label="router-name">
        </el-table-column>
        <el-table-column
                align="center"
                prop="meta"
                label="meta">
        </el-table-column>
        <el-table-column
                align="center"
                prop="meta"
                label="操作">
          <template slot-scope="{row}" >
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
          <el-input v-model="menu.title"></el-input>
        </el-form-item>
        <el-form-item label="路由名称" prop="name">
          <el-input v-model="menu.name"></el-input>
        </el-form-item>
        <el-form-item label="访问地址" prop="path">
          <el-input v-model="menu.path"></el-input>
        </el-form-item>
        <el-form-item label="组件地址" prop="component">
          <el-input v-model="menu.component"></el-input>
        </el-form-item>
        <el-form-item label="排序号">
          <el-input v-model="menu.sort" type="number"></el-input>
        </el-form-item>
        <el-form-item label="重定向地址">
          <el-input v-model="menu.redirect"></el-input>
        </el-form-item>
        <el-form-item label="是否隐藏">
          <el-switch
                  v-model="menu.hidden"
                  active-color="#13ce66"
                  inactive-color="#ff4949">
          </el-switch>
        </el-form-item>
        <el-form-item label="是否固定菜单栏">
          <el-switch
                  v-model="menu.alwaysShow"
                  active-color="#13ce66"
                  inactive-color="#ff4949">
          </el-switch>
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
import { menuList, childMenuList } from '@/api/system/menu'
import { validNotNull, validNotCN } from '@/utils/validate'
export default {
  name: 'menuComponent',
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
        meta: {}
      },
      dialogTitle: '新增菜单',
      rules: {
        title: validNotNull(),
        name: [{ required: true, message: '该项为必填项，请填写完整！' }, { validator: validNotCN, trigger: 'blur' }],
        path: validNotNull(),
        component: validNotNull(),
      }
    }
  },
  created() {
    this.list = this.getList()
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
        title: '',
        name: '',
        path: '',
        component: '',
        sort: 0,
        hidden: false,
        alwaysShow: false,
        redirect: '',
        meta: {}
      }
      this.dialogFormVisible = true
    },
    editMenu(row) {

    },
    saveForm() {

    }
  }
}
</script>
<style scoped>
  .el-card {
    border: 0
  }
</style>
