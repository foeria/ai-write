import { test, expect } from '@playwright/test'

test.describe('导航测试', () => {
  test('应该能够导航到角色库页面', async ({ page }) => {
    await page.goto('/')

    // 点击侧边栏中的角色库菜单
    await page.getByRole('menuitem', { name: '角色库' }).click()

    // 验证页面跳转
    await expect(page).toHaveURL('/characters')
  })

  test('应该能够导航到知识库页面', async ({ page }) => {
    await page.goto('/')

    // 点击侧边栏中的知识库菜单
    await page.getByRole('menuitem', { name: '知识库' }).click()

    // 验证页面跳转
    await expect(page).toHaveURL('/knowledge')
  })

  test('应该能够导航到工具库页面', async ({ page }) => {
    await page.goto('/')

    // 点击侧边栏中的工具库菜单
    await page.getByRole('menuitem', { name: '工具库' }).click()

    // 验证页面跳转
    await expect(page).toHaveURL('/tools')
  })

  test('应该能够导航到工作流管理页面', async ({ page }) => {
    await page.goto('/')

    // 点击侧边栏中的工作流管理菜单
    await page.getByRole('menuitem', { name: '工作流管理' }).click()

    // 验证页面跳转
    await expect(page).toHaveURL('/workflow')
  })
})
