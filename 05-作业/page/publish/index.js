/**
 * 目标1：设置频道下拉菜单
 *  1.1 获取频道列表数据
 *  1.2 展示到下拉菜单中
 */

const urlParams = location.search

async function getChannels() {
    const result = await axios({url: `/v1_0/channels`})
    document.querySelector('#channel_id').innerHTML = `<option value="">请选择文章频道</option>` +
        result.data.channels.map(item => {
            return `<option value="${item.id}">${item.name}</option>`
        }).join(``)
}

getChannels()
/**
 * 目标2：文章封面设置
 *  2.1 准备标签结构和样式
 *  2.2 选择文件并保存在 FormData
 *  2.3 单独上传图片并得到图片 URL 网址
 *  2.4 回显并切换 img 标签展示（隐藏 + 号上传标签）
 */
const {createEditor, createToolbar} = window.wangEditor

const editorConfig = {
    placeholder: '请输入文章内容...',
    onChange(editor) {
        const html = editor.getHtml()
        console.log('editor content', html)
        document.querySelector('.publish-content').value = html
        // 也可以同步到 <textarea>
    }
}

const editor = createEditor({
    selector: '#editor-container',
    html: '<p><br></p>',
    config: editorConfig,
    mode: 'default', // or 'simple'
})

const toolbarConfig = {}

const toolbar = createToolbar({
    editor,
    selector: '#toolbar-container',
    config: toolbarConfig,
    mode: 'default', // or 'simple'
})
document.querySelector(`.img-file`).addEventListener("change", async (e) => {
    const formData = new FormData()
    formData.append("image", e.target.files[0])
    const result = await axios({url: `/v1_0/upload`, method: `POST`, data: formData})
    document.querySelector('.place').classList.add("hide")
    document.querySelector('.rounded').classList.add("show")
    document.querySelector('.rounded').src = result.data.url
})
document.querySelector('.rounded').addEventListener('click', () => {
    document.querySelector(`.img-file`).click()

})
/**
 * 目标3：发布文章保存
 *  3.1 基于 form-serialize 插件收集表单数据对象
 *  3.2 基于 axios 提交到服务器保存
 *  3.3 调用 Alert 警告框反馈结果给用户
 *  3.4 重置表单并跳转到列表页
 */
document.querySelector(`.send`).addEventListener("click", async (e) => {

    const publishForm = document.querySelector('.art-form')
    const data = serialize(publishForm, {hash: true, empty: true})
    const url = document.querySelector('.rounded').src
    data.cover = {
        type: url ? 0 : 1,
        images: [url]
    }
    console.log(data)
    try {
        const result = urlParams ? await axios({url: `/v1_0/mp/articles/${data.id}`, method: `PUT`, data})
            : await axios({url: `/v1_0/mp/articles`, method: `POST`, data})
        editor.setHtml(`<p><br></p>`)
        publishForm.reset()
        document.querySelector('.place').classList.remove("hide")
        document.querySelector('.rounded').classList.remove("show")
        document.querySelector('.rounded').src = ``
        myAlert(true, urlParams ? "文章编辑成功" : "文章发布成功")
        setTimeout(()=>{location.href = `../content/index.html`}, 1000)
        console.log(result)
    } catch
        (e) {
        myAlert(false, e.response.data.message)
    }

})
/**
 * 目标4：编辑-回显文章
 *  4.1 页面跳转传参（URL 查询参数方式）
 *  4.2 发布文章页面接收参数判断（共用同一套表单）
 *  4.3 修改标题和按钮文字
 *  4.4 获取文章详情数据并回显表单
 */
;(() => {
    const urlParams = location.search
    if (urlParams) {
        document.querySelector(`.title`).innerHTML = `<span>编辑文章</span>`
        document.querySelector(`.send`).innerHTML = `<span>编辑</span>`
        new URLSearchParams(urlParams).forEach(async (value, key) => {
            if ("id" === key) {
                const result = await axios({url: `/v1_0/mp/articles/${value}`})
                console.log(result)
                const data = result.data;
                delete data.pub_date
                Object.keys(data).forEach(key => {
                    if ('cover' === key) {
                        if (data[key].type === 1) {
                            document.querySelector('.place').classList.add("hide")
                            document.querySelector('.rounded').classList.add("show")
                            document.querySelector('.rounded').src = data[key].images[0]
                        }
                    } else if ('content' === key) {
                        editor.setHtml(data[key])
                    } else {
                        document.querySelector(`[name=${key}]`).value = data[key]
                    }
                })
            }
        })
    }
    console.log()
})()
/**
 * 目标5：编辑-保存文章
 *  5.1 判断按钮文字，区分业务（因为共用一套表单）
 *  5.2 调用编辑文章接口，保存信息到服务器
 *  5.3 基于 Alert 反馈结果消息给用户
 */