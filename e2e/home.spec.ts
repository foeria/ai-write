import { test, expect } from '@playwright/test'

test.describe('首页加载测试', () => {
  test('首页应该正确加载', async ({ page }) => {
    await page.goto('/')

    // 检查页面标题或欢迎文字
    await expect(page.getByText('开始今天的创作吧')).toBeVisible()

    // 检查统计卡片 - 使用 exact 匹配
    await expect(page.getByText('创作项目', { exact: true })).toBeVisible()
    await expect(page.getByText('进行中')).toBeVisible()
    await expect(page.getByText('章节总数')).toBeVisible()
    await expect(page.getByText('字数统计')).toBeVisible()

    // 检查新建小说按钮
    await expect(page.getByRole('button', { name: '新建小说' })).toBeVisible()
  })

  test('侧边栏应该正常显示', async ({ page }) => {
    await page.goto('/')

    // 检查侧边栏元素
    await expect(page.getByText('AI写作助手')).toBeVisible()
  })

  test('小说列表应该显示', async ({ page }) => {
    await page.goto('/')

    // 检查我的作品标题
    await expect(page.getByRole('heading', { name: '我的作品' })).toBeVisible()

    // 检查已有的小说卡片 - 使用 first() 解决多个匹配问题
    await expect(page.getByText('我的第一部小说').first()).toBeVisible()
    await expect(page.getByText('科幻短篇').first()).toBeVisible()
  })
})
