// axios 公共配置
// 基地址
axios.defaults.baseURL = `http://geek.itheima.net`
axios.interceptors.request.use(config => {
    const token = localStorage.getItem("token")
    token && config.headers.set(`Authorization`, `Bearer ${token}`)
    return config
})
axios.interceptors.response.use(response => {
    return response.data
}, error => {
    if (error?.response?.status === 401) {
        alert("登录过期，请重新登录")
        localStorage.clear()
        location.href=`../login/index.html`
    }
    return Promise.reject(error)
})