import { createContext, useContext, useState } from 'react'

const StatsContext = createContext(null)

export const StatsProvider = ({ children }) => {
  const [githubData, setGithubData] = useState(null)
  const [githubUsername, setGithubUsername] = useState('')
  const [leetcodeData, setLeetcodeData] = useState(null)
  const [leetcodeUsername, setLeetcodeUsername] = useState('')
  const [codeforcesData, setCodeforcesData] = useState(null)
  const [codeforcesHandle, setCodeforcesHandle] = useState('')
  const [recommendationsData, setRecommendationsData] = useState(null)

  const clearAll = () => {
    setGithubData(null)
    setGithubUsername('')
    setLeetcodeData(null)
    setLeetcodeUsername('')
    setCodeforcesData(null)
    setCodeforcesHandle('')
    setRecommendationsData(null)
  }

  return (
    <StatsContext.Provider value={{
      githubData, setGithubData, githubUsername, setGithubUsername,
      leetcodeData, setLeetcodeData, leetcodeUsername, setLeetcodeUsername,
      codeforcesData, setCodeforcesData, codeforcesHandle, setCodeforcesHandle,
      recommendationsData, setRecommendationsData,
      clearAll
    }}>
      {children}
    </StatsContext.Provider>
  )
}

export const useStats = () => useContext(StatsContext)