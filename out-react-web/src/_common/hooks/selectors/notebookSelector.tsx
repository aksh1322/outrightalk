import { useSelector } from 'react-redux'
import { StateExtended } from 'src/_common/interfaces/StateExtended'


export const useAppNotebookList = () => {
    const notebookList = useSelector((state: StateExtended) => state.notebook.getNotebookList)
    return notebookList;
}

export const useAppNotebookContactListUser = () => {
    const contactList = useSelector((state: StateExtended) => state.notebook.getNotebookContactListUser)
    return contactList;
}

export const useAppNoteBookDetails = () => {
    const notebookDetails = useSelector((state: StateExtended) => state.notebook.getNotebookDetails)
    return notebookDetails;
}