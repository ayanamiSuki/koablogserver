export const resOk = ({ code = 0, msg = '请求成功', data }) => ({ code, msg, data })
export const resDataOk = (data) => ({ code: 0, msg: '请求成功', data })
export const resFailed = ({ code = -1, msg = '请求失败', data = [] }) => ({ code, msg, data })
export const resDataFailed = (msg = '请求失败') => ({ code: -1, msg, data: null })