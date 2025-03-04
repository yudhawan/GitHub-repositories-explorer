import { useEffect, useState } from "react"
import "./App.css"
import { useQuery } from "@tanstack/react-query"
import { getData } from "./services/get_data_services"
import { GitHubResponseUserType, RepoType, UserType } from "./types"
import { ChevronDownIcon, ChevronUpIcon, StarIcon } from "@heroicons/react/20/solid"

function App() {
  const [search, setSearch] = useState<string>("")
  const [getUsers, setUsers] = useState<UserType[]>([])
  const [getRepos, setRepos] = useState<RepoType[]>([])
  const [selectUsers, setSelectUsers] = useState<string>("")
  const [validation, setValidation] = useState<string>("")

  const { data: data_users, isFetching: isloading, refetch: refetchUser } = useQuery<GitHubResponseUserType>({
    queryKey: ["users", search],
    queryFn: () => getData(`search/users?q=${search}&per_page=5`),
    enabled: false,
  })

  const { data: data_repos = [], isFetching: isloadingRepos, refetch: refetchRepos } = useQuery({
    queryKey: ["repos", selectUsers],
    queryFn: () => getData(`users/${selectUsers}/repos`),
    enabled: !!selectUsers,
  })

  function handleSelectedUser(id: string) {
    if (selectUsers === id) {
      setSelectUsers("")
      setRepos([])
    } else {
      setSelectUsers(id)
      refetchRepos()
    }
  }
  
  useEffect(() => {
    if (data_users?.items && data_users.items.length) {
      setUsers(data_users.items)
      setValidation("")
    } else if (data_users?.items.length === 0) {
      setValidation("Cannot find user, please try another one.")
    }
  }, [data_users])

  useEffect(() => {
    if (data_repos.length) {
      setRepos(data_repos)
      setValidation("")
    }
  }, [data_repos])

  return (
    <div className="w-full flex flex-col gap-5 py-6 sm:max-w-[900px] px-4 sm:px-0">
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          if (!search.trim()) {
            return setValidation("Please enter a username before searching.")
          }
          refetchUser()
        }}
      >
        <div className="rounded py-1 px-2 border border-gray-400 h-10">
          <input
            onChange={(e) => setSearch(e.target.value)}
            value={search}
            className="outline-0 w-full h-full text-sm sm:text-base"
            placeholder="Enter Username"
          />
        </div>
        <button
          className="!bg-blue-500 rounded text-white h-10 text-sm sm:text-base"
          onClick={() => {
            if (!search.trim()) {
              return setValidation("Please enter a username before searching.")
            }
            refetchUser()
          }}
        >
          Search
        </button>
      </form>

      <div className="flex flex-col gap-3">
        {validation && (
          <span className="bg-red-50 border border-red-500 text-red-500 font-semibold px-2 py-1 rounded-md text-sm sm:text-base">
            {validation}
          </span>
        )}
        {getUsers.length > 0 && <span className="text-sm sm:text-base">Showing users for <b>"{search}"</b></span>}

        <ul className="flex flex-col list-none gap-3">
          {getUsers.map((val) => (
            <li key={val.id}>
              <div className="flex flex-col gap-3">
                <div
                  className="bg-neutral-400 py-2 px-3 text-black flex w-full justify-between items-center cursor-pointer text-sm sm:text-base"
                  onClick={() => handleSelectedUser(val.login)}
                >
                  <span>{val.login}</span>
                  {selectUsers === val.login ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                </div>

                {selectUsers === val.login && (
                  <ul className="list-none ml-3 flex flex-col gap-3">
                    {getRepos.map((rep) => (
                      <li key={rep.id}>
                        <div className="bg-gray-400 p-2 flex flex-col gap-2 text-sm sm:text-base">
                          <div className="w-full justify-between flex">
                            <span className="w-full line-clamp-1 font-semibold">{rep.name}</span>
                            <div className="flex gap-1 items-center">
                              <span>{rep.stargazers_count}</span>
                              <StarIcon className="w-3 h-3" />
                            </div>
                          </div>
                          <span>{rep.description}</span>
                        </div>
                      </li>
                    ))}
                    {!getRepos.length && !isloadingRepos && <li><span className="text-sm sm:text-base">No Data Repo</span></li>}
                    {isloadingRepos && Array(3).fill("").map((_, i) => (
                      <li key={i}><div className="h-10 bg-gray-400 animate-pulse w-full ml-3"></div></li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
          {isloading && Array(3).fill("").map((_, i) => (
            <li key={i}><div className="h-10 bg-gray-400 animate-pulse w-full"></div></li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default App

