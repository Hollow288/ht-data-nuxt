import { defineStore } from 'pinia'

export const useSidebarStore = defineStore('sidebar', {
    state: () => ({
        current: '',              // 当前显示哪个组件
        componentProps: {} as any // 组件的参数
    }),
    actions: {
        setSidebar(component: string, props: any = {}) {
            this.current = component
            this.componentProps = props
        }
    }
})


export function useSidebar(component: string, props: any = {}) {
    const sidebar = useSidebarStore()
    onMounted(() => {
        sidebar.setSidebar(component, props)
    })
}
