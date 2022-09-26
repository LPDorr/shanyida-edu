import { defineStore } from "pinia";
import { ref } from 'vue'

export default defineStore('auth', () => {
    const token = ref<string>('');
    const userName = ref<string>('');

    const login = (u: string,t: string) => {
        token.value = t;
        userName.value = u;
    };
    const logout = () => {
        token.value = '';
        userName.value = '';
    };
    return { token, userName, login, logout };
}, {
    persist: {
        enabled: true,
    }
})
