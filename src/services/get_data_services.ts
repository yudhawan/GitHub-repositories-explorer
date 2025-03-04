

export async function getData(url:string):Promise<any> {
    try {
        const resposnse = await fetch(import.meta.env.VITE_GITHUB_API+url,{
            headers:{
                Authorization:import.meta.env.VITE_GITHUB_TOKEN_API
            }
        })
        const result = await resposnse.json()
        if(!resposnse.ok) throw new Error(result.message)
        return result
    } catch (error) {
        throw error
    }
}