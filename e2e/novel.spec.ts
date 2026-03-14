import { test, expect } from '@playwright/test'

test.describe('创建小说测试', () => {
  test('应该能够打开创建小说模态框', async ({ page }) => {
    await page.goto('/')

    // 点击新建小说按钮
    await page.getByRole('button', { name: '新建小说' }).click()

    // 检查模态框标题
    await expect(page.getByText('新建书籍')).toBeVisible()

    // 检查表单字段
    await expect(page.getByText('书籍名称')).toBeVisible()
    await expect(page.getByText('作品分类')).toBeVisible()

    // 能够填写表单
    await page.getByPlaceholder('请输入书籍名称').fill('测试小说')
    await expect(page.getByPlaceholder('请输入书籍名称')).toHaveValue('测试小说')
  })

  test('应该能够打开分类下拉菜单', async ({ page }) => {
    await page.goto('/')

    // 点击新建小说按钮
    await page.getByRole('button', { name: '新建小说' }).click()

    // 填写小说标题
    await page.getByPlaceholder('请输入书籍名称').fill('测试小说')

    // 点击分类选择框
    await page.locator('.ant-select-selection-item').filter({ hasText: '请选择分类' }).click()

    // 验证下拉菜单已打开
    await expect(page.locator('.ant-select-dropdown')).toBeVisible()
  })

  test('应该能够打开小说工作区', async ({ page }) => {
    await page.goto('/')

    // 找到小说卡片的"写作"按钮并点击
    const novelCard = page.locator('.ant-card').filter({ hasText: '我的第一部小说' }).first()
    await novelCard.getByRole('button', { name: '写作' }).click()

    // 验证进入工作区页面
    await expect(page).toHaveURL(/\/novel\/workspace\/\d+/)
  })
})
