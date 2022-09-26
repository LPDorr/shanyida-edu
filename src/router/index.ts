import { createRouter, createWebHashHistory, } from "vue-router";
import {useAuthStore} from "@/store";


const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        { path: '/', redirect: '/login' },
        { path: '/login', component: () => import('../views/EduLogin.vue') },
        {
            path: '/home',
            component: () => import('../views/EduHome.vue'),
            meta: { auth: true },
            children: [
                { path: 'func', components: { func: () => import('../views/EduFunc.vue') } },
                { path: 'rolefunc', components: { rolefunc: () => import('../views/EduRoleFunc.vue') } },
                { path: 'userrole', components: { userrole: () => import('../views/EduUserRole.vue') } },
                { path: 'classroom', components: { classroom: () => import('../views/EduClassroom.vue') } },
                { path: 'class', components: { class: () => import('../views/EduClass.vue') } },
                { path: 'student', components: { student: () => import('../views/EduStudent.vue') } },
                { path: 'staff', components: { staff: () => import('../views/EduStaff.vue') } },
                { path: 'password', components: { password: () => import('../views/EduPassword.vue') } },
            ],

        },
    ]
});
router.beforeEach((to,from, next) => {
    console.log(sessionStorage.auth)
    console.log()
    if(to.fullPath === '/login') {
        return next()
    }
    // if(sessionStorage.auth === undefined) return next('/login')
    if(useAuthStore().token === '') return next('/login')
    next()
})
export default router;
