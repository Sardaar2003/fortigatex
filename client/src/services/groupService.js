import axios from '../utils/axios';

const createGroup = async (groupData) => {
    const response = await axios.post('/api/groups', groupData);
    return response.data;
};

const getGroups = async () => {
    const response = await axios.get('/api/groups');
    return response.data;
};

const getGroupDetails = async (id) => {
    const response = await axios.get(`/api/groups/${id}`);
    return response.data;
};

const updateGroup = async (id, groupData) => {
    const response = await axios.put(`/api/groups/${id}`, groupData);
    return response.data;
};

const deleteGroup = async (id) => {
    const response = await axios.delete(`/api/groups/${id}`);
    return response.data;
};

const addMember = async (id, email) => {
    const response = await axios.put(`/api/groups/${id}/members`, { email });
    return response.data;
};

const removeMember = async (groupId, userId) => {
    const response = await axios.delete(`/api/groups/${groupId}/members/${userId}`);
    return response.data;
};

const getGroupReport = async (id, startDate, endDate) => {
    const response = await axios.get(`/api/groups/${id}/report`, { params: { startDate, endDate } });
    return response.data;
};

const groupService = {
    createGroup,
    getGroups,
    getGroupDetails,
    updateGroup,
    deleteGroup,
    addMember,
    getGroupReport
};

export default groupService;
