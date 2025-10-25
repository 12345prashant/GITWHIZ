import { api } from '@/trpc/react'
import React from 'react'
// import {useLocalStorage} from 'usehooks-ts'
import { useLocalStorage } from 'usehooks-ts'



// This hook will show the projects created by user with a css color was seslected project
const useProject = () => {
  const {data: projects} = api.project.getProjects.useQuery();
  const [projectId, setProjectId] = useLocalStorage('dionysus-projectId','');

  const project = projects?.find(project => project.id === projectId);
  return {
   projects,
   project,
   projectId,
   setProjectId,
}
}

export default useProject
