interface mapTree {
  name: any
  children?: mapTree[]
}

// 递归树形结构数据，返回相同同构数据
export const mapTree = (data: { [key: string]: any }[]): mapTree[] => {
  return data.map((item: { [key: string]: any }) => {
    if (item.children) {
      return {
        name: item.name,
        children: mapTree(item.children)
      }
    }
    return {
      name: item.name
    }
  })
}

export const post = (url: string, body?: any, headers = {}) => {
  return fetch(url, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify(body)
  }).then(response => response.json())
}

export const get = (url: string) => {
  return fetch(url).then(response => response.json())
}

/**
 * 文件流加载文件，此方法火狐需要设置javascript.options.streams为true，ie无法兼容
 * @param url 地址
 * @param param 参数
 */
export const loadFileByBlob = (url: string, param: object | []) => {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    mode: 'cors',
    body: JSON.stringify(param)
  })
    .then(response => response.body)
    .then(rs => {
      if (!rs) return
      const reader = rs.getReader()
      return new ReadableStream({
        async start(controller) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) {
              break
            }
            controller.enqueue(value)
          }
          controller.close()
        }
      })
    })
    .then(rs => new Response(rs))
    .then(response => response.blob())
}
