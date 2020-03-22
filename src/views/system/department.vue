<template>
  <div class="app-container">
    <el-card class="box-card" style="bottom: 0">
      <div class="main-content">
        <el-container>
          <el-main>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteRow">删除</el-button>
            <el-divider />
          </el-main>
        </el-container>
        <el-container style="height: 800px">
          <el-aside style="padding: 0;background: #fff;" :width="asideWidth">

            <div :style="{width: asideWidth}" class="el-tips">
              <span class="el-tips-icon">
                <i class="el-icon-info" />
              </span>
              <span>当前选中的节点：<span style="color: #4A9FF9">{{ selectName }}</span></span>
            </div>
            <div style="padding-top: 10px;padding-bottom: 10px">
              <el-input
                v-model="filterText"
                placeholder="请输入内容"
              >
                <i slot="suffix" class="el-input__icon el-icon-search" />
              </el-input>
            </div>
            <el-tree
              ref="groupTree"
              node-key="id"
              :data="treeList"
              :default-expanded-keys="expandedNode"
              :filter-node-method="filterNode"
              accordion
              highlight-current
              @node-click="handleNodeClick"
            />
          </el-aside>

          <el-main>
            <el-form ref="form" :model="formData" label-width="120px" size="mini" :rules="rules">
              <el-form-item label="名称" prop="name">
                <el-input v-model="formData.name" size="mini" :style="{width: inputWidth}" />
              </el-form-item>
              <el-form-item label="上级名称">
                <el-input v-model="parentName" size="mini" :style="{width: inputWidth}" readonly />
                <el-popover
                  placement="right"
                  width="400"
                  trigger="click"
                >
                  <el-tree
                    ref="groupTree1"
                    node-key="id"
                    :data="treeList"
                    accordion
                    highlight-current
                    @node-click="selectNode"
                  />
                  <el-button slot="reference" icon="el-icon-edit-outline" circle />
                </el-popover>
              </el-form-item>
              <el-form-item label="部门负责人">
                <el-autocomplete
                  v-model="mainChargeUserName"
                  :style="{width: inputWidth}"
                  :fetch-suggestions="querySearch"
                  placeholder="请输入内容"
                  :trigger-on-focus="false"
                  @select="handleSelect"
                />
              </el-form-item>
              <el-form-item label="排序号">
                <el-input v-model="formData.sort" size="mini" :style="{width: inputWidth}" type="number" />
              </el-form-item>
              <el-form-item label="部门编码">
                <el-input v-model="levelCode" size="mini" :style="{width: inputWidth}" disabled />
              </el-form-item>
              <el-form-item label="">
                <el-button type="primary" icon="el-icon-edit" @click="saveForm">保存</el-button>
                <el-button @click="clearForm">重置</el-button>
              </el-form-item>
            </el-form>
          </el-main>

        </el-container>
      </div>
    </el-card>
  </div>
</template>

<script>
import { saveFormData, treeList, deleteData, departmentInfo } from '@/api/system/department'
import { getList } from '@/api/system/user'
import { validNotNull } from '@/utils/validate'
export default {
  name: 'Department',
  filters: {
    toString(val) {
      return '' + val
    }
  },
  data() {
    return {
      pager: {
        totalCount: 0,
        pageCount: 1,
        pageSize: 10,
        currentPage: 1
      },
      formData: {
        id: '',
        name: '',
        parentId: '',
        mainChargeUserId: '',
        sort: 0
      },
      rules: {
        name: validNotNull()
      },
      treeList: [],
      selectId: '',
      selectName: '',
      expandedNode: [],
      filterText: '', // 树过滤内容
      parentName: '',
      levelCode: '',
      mainChargeUserName: ''
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
  watch: {
    filterText(val) {
      this.$refs.groupTree.filter(val)
    }
  },
  created() {
    this.getTreeList()
  },
  methods: {
    headClass(row, column, rowIndex, columnIndex) {
      return 'tableHead'
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
              this.getTreeList()
              this.clearForm()
            }
          })
        }
      })
    },
    clearForm() {
      this.formData = {
        id: '',
        name: '',
        parentId: '',
        mainChargeUserId: '',
        sort: 0
      }
      this.mainChargeUserName = ''
      this.levelCode = ''
      this.selectName = ''
      this.parentName = ''
      this.$refs.groupTree.setCurrentKey(null)
      this.$refs.groupTree1.setCurrentKey(null)
      this.selectId = ''
    },
    getTreeList() {
      treeList().then(res => {
        if (res.code === 1) {
          this.treeList = res.data
        }
      })
    },
    deleteRow() {
      if (!this.selectId) {
        this.$message({
          message: '请选择需要删除的节点，删除父级会同时删除挂靠在下面的节点！',
          type: 'warning'
        })
        return
      }
      var data = [this.selectId]
      deleteData(data).then(res => {
        if (res.code === 1) {
          this.$message({
            message: res.msg,
            type: 'success'
          })
          this.getTreeList()
        }
      })
    },
    handleSelect(item) {
      this.formData.mainChargeUserId = item.id
    },
    querySearch(queryString, cb) {
      if (queryString.trim()) {
        getList({
          name: queryString
        }).then(res => {
          if (res.code === 1) {
            // 调用 callback 返回建议列表的数据
            cb(res.data.list.map(item => {
              return {
                value: item.name,
                id: item.id
              }
            }))
          }
        })
      }
    },
    handleNodeClick(data) {
      this.selectName = data.label
      this.selectId = data.id
      departmentInfo(this.selectId).then(res => {
        if (res.code === 1) {
          const data = res.data
          this.formData = {
            id: data.id,
            name: data.name,
            parentId: data.parentId,
            mainChargeUserId: data.mainChargeUserId,
            sort: data.sort
          }
          this.mainChargeUserName = data.mainChargeUserName
          this.parentName = data.parentName
          this.levelCode = data.levelCode
        }
      })
    },
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    selectNode(node) {
      this.parentName = node.label
      this.formData.parentId = node.id
    }
  }
}
</script>
<style scoped>
  .el-main {
    padding: 0;
  }
</style>
