export const resOk = ({ code = 0, msg = '请求成功', data }) => ({ code, msg, data })
export const resDataOk = (data) => ({ code: 0, msg: '请求成功', data })
export const resMsgOk = (msg) => ({ code: 0, msg, data: true })
export const resFailed = ({ code = -1, msg = '请求失败', data = [] }) => ({ code, msg, data })
export const resMsgFailed = (msg = '请求失败') => ({ code: -1, msg, data: null })

export const resolveAuthorizationHeader = (authorization) => {
    if (!authorization) {
        return;
    }
    const parts = authorization.split(' ');
    if (parts.length === 2) {
        const scheme = parts[0];
        const credentials = parts[1];
        if (/^Bearer$/i.test(scheme)) {
            return credentials;
        }
    }
    return;
}