import request from '@/utils/axiosRequest'

export function getList(query) {
  const url = '/dictionary/list'
  return request({
    url: url,
    method: 'get',
    params: query
  })
}

export function getRootList() {
  const url = '/dictionary/rootList'
  return request({
    url: url,
    method: 'get'
  })
}

export function saveFormData(data) {
  const url = '/dictionary/save'
  return request({
    url: url,
    method: 'post',
    data
  })
}

export function deleteData(data, parentId) {
  let url = '/dictionary/delete/'
  if (parentId) {
    url += '?parentId=' + parentId
  }
  return request({
    url: url,
    method: 'post',
    data
  })
}

export function enabledDictionary(id, enable) {
  const url = '/dictionary/enabled/' + id + '?enable=' + enable
  return request({
    url: url,
    method: 'get'
  })
}
