// 对axios的封装
import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';
import {ElLoading, ElMessageBox} from 'element-plus';
import {useAuthStore} from '@/store';

let withLoading = true;
type HttpResult<R> = { status: 200 | 199 | 404 | 401 | 500, data: R, message: string };

// T 表示这次ajax要传到服务器的数据的类型;R 表示这次ajax成功后data节点携带的数据的类型
export async function http<T = any, R = any>(options: AxiosRequestConfig<T>) {
    options.url = '/api' + options.url;
    options.headers = Object.assign(
        {authorization: useAuthStore().token},
        options.headers || {}
    );
    let loadingInstance:any;
    if(withLoading) {
        loadingInstance = ElLoading.service({background: "rgba(0,0,0,0.8)", text: "Loading.."});// 开启loading效果
        // 故意让axios晚发一秒，让loading效果出来(真实开发勿用)
        await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
    }
    return axios(options)
        .then((response: AxiosResponse<HttpResult<R>>) => {
            if(response.status === 200) return response.data;
            else throw new Error(response.statusText);
        })
        .then((result: HttpResult<R>) => {
            switch(result.status) {
                case 200:
                    if(withLoading) loadingInstance.close();    // 成功：关闭loading效果
                    return result.data;
                case 199:
                case 401:
                case 404:
                case 500:
                    throw new Error(result.message);
            }
        })
        .catch((e: Error) => {
            if(withLoading) loadingInstance.close();            // 失败：关闭loading效果（不管前面哪里错了，都会执行到这里，统一在这里关闭）
            ElMessageBox.alert(e.message, "Tip:", {});
            return Promise.reject(e.message);
        });
}
// 批量执行http任务
export async function httpBatch(asyncTasks: Array<() => Promise<any>>, sequence = false): Promise<any[]> {
    withLoading = false;
    let loadingInstance = ElLoading.service({background: "rgba(0,0,0,0.8)", text: "Loading.."});// 开启loading效果
    // 故意让批量HTTP任务晚开始一秒，让loading效果出来(真实开发勿用)
    await new Promise<void>(resolve => setTimeout(() => resolve(), 300));
    // 开始批量HTTP任务
    return new Promise(async (resolve, reject) => {
        let count = 0, result: any[]= [];
        if(sequence) {
            try {
                for(let i = 0; i < asyncTasks.length; i++) {
                    let r = await asyncTasks[i]();
                    result.push(r);
                }
                resolve(result);
            } catch(e) {
                reject(e);
            } finally {
                loadingInstance.close();
                withLoading = true;
            }
        }
        else {
            for(let i = 0; i < asyncTasks.length; i++) {
                Promise.resolve(asyncTasks[i]())
                    .then(res => {
                        result[i] = res;
                        count++;
                        if(count === asyncTasks.length) {
                            loadingInstance.close();
                            withLoading = true;
                            resolve(result);
                        }
                    })
                    .catch((e: Error) => {
                        loadingInstance.close();
                        withLoading = true;
                        reject(e);
                    });
            }
        }
    });
}
