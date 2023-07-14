/**
 * 目标1：获取文章列表并展示
 *  1.1 准备查询参数对象
 *  1.2 获取文章列表数据
 *  1.3 展示到指定的标签结构中
 */
let total_count = 0
const params = {
    status: ``,
    channel_id: ``,
    page: 1,
    per_page: 2,
}

async function getArticles() {
    const result = await axios({url: `/v1_0/mp/articles`, params})
    total_count = result.data.total_count
    document.querySelector('.total-count').innerHTML = `共${total_count}条`
    document.querySelector('.page-now').innerHTML = `第${params.page}页`
    document.querySelector(`.art-list`).innerHTML =
        result.data.results.map(item => {
            return `<tr>
                <td>
                  <img src="${item.cover.type === 1 ? item.cover.images[0] : `https://img2.baidu.com/it/u=2640406343,1419332367&fm=253&fmt=auto&app=138&f=JPEG?w=708&h=500`}" alt="">
                </td>
                <td>${item.title}</td>
                <td>
                ${item.status === 2 ? `<span className="badge text-bg-success">审核通过</span>` :
                `<span className="badge text-bg-primary">待审核</span>`}
                </td>
                <td>
                  <span>${item.pubdate}</span>
                </td>
                <td>
                  <span>${item.read_count}</span>
                </td>
                <td>
                  <span>${item.comment_count}</span>
                </td>
                <td>
                  <span>${item.like_count}</span>
                </td>
                <td data-id="${item.id}">
                  <i class="bi bi-pencil-square edit"></i>
                  <i class="bi bi-trash3 del"></i>
                </td>
              </tr>`
        }).join(``)
    console.log(result)
}

getArticles()

/**
 * 目标2：筛选文章列表
 *  2.1 设置频道列表数据
 *  2.2 监听筛选条件改变，保存查询信息到查询参数对象
 *  2.3 点击筛选时，传递查询参数对象到服务器
 *  2.4 获取匹配数据，覆盖到页面展示
 */

async function getChannels() {
    const result = await axios({url: `/v1_0/channels`})
    document.querySelector('[name="channel_id"]').innerHTML =
        `<option value="">请选择文章频道</option>` +
        result.data.channels.map(item => {
            return `<option value="${item.id}">${item.name}</option>`
        }).join(``)
}

getChannels()

document.querySelector(`.sel-btn`).addEventListener('click', () => {
    const selForm = document.querySelector(`.sel-form`)
    const data = serialize(selForm, {hash: true, empty: true})
    params.status = data.status
    params.channel_id = data.channel_id
    getArticles()
})

/**
 * 目标3：分页功能
 *  3.1 保存并设置文章总条数
 *  3.2 点击下一页，做临界值判断，并切换页码参数并请求最新数据
 *  3.3 点击上一页，做临界值判断，并切换页码参数并请求最新数据
 */
document.querySelector(`.last`).addEventListener(`click`, () => {
    if (params.page > 1) {
        params.page--
        getArticles()
    }
})
document.querySelector(`.next`).addEventListener(`click`, () => {
    if (params.page < Math.ceil(total_count / params.per_page)) {
        params.page++
        getArticles()
    }
})

/**
 * 目标4：删除功能
 *  4.1 关联文章 id 到删除图标
 *  4.2 点击删除时，获取文章 id
 *  4.3 调用删除接口，传递文章 id 到服务器
 *  4.4 重新获取文章列表，并覆盖展示
 *  4.5 删除最后一页的最后一条，需要自动向前翻页
 */
document.querySelector('.art-list').addEventListener(`click`, async (e) => {
    if (e.target.classList.contains(`del`)) {
        const id = e.target.parentNode.dataset.id
        console.log(`删除${id}`)
        const result = await axios({url: `/v1_0/mp/articles/${id}`, method: `DELETE`})
        console.log(result)
        if (document.querySelector(`.art-list`).childNodes.length === 1) {
            document.querySelector(`.last`).click()
        } else {
            getArticles()
        }
    } else if (e.target.classList.contains(`edit`)) {
        const id = e.target.parentNode.dataset.id
        location.href = `../publish/index.html?id=${id}`
        console.log("编辑${id}")
    }
})
// 点击编辑时，获取文章 id，跳转到发布文章页面传递文章 id 过去

