import React, { useState, useEffect, useContext } from 'react';
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Alert,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
    Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import groupService from '../../services/groupService';
import axios from '../../utils/axios';

const GroupManagement = () => {
    const [groups, setGroups] = useState([]);
    const [users, setUsers] = useState([]);
    const [open, setOpen] = useState(false);
    const [openMembers, setOpenMembers] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentGroup, setCurrentGroup] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        managerId: ''
    });
    const [memberEmail, setMemberEmail] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetchGroups();
        fetchUsers();
    }, []);

    const fetchGroups = async () => {
        try {
            const res = await groupService.getGroups();
            setGroups(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get('/api/users');
            const userList = res.data.data || res.data;
            setUsers(userList);
        } catch (err) {
            console.error("Failed to fetch users", err);
        }
    };

    const handleOpen = (group = null) => {
        if (group) {
            setEditMode(true);
            setCurrentGroup(group);
            setFormData({
                name: group.name,
                description: group.description,
                managerId: group.manager?._id || ''
            });
        } else {
            setEditMode(false);
            setCurrentGroup(null);
            setFormData({
                name: '',
                description: '',
                managerId: ''
            });
        }
        setOpen(true);
        setError('');
    };

    const handleClose = () => {
        setOpen(false);
        setCurrentGroup(null);
    };

    const handleOpenMembers = (group) => {
        setCurrentGroup(group);
        setOpenMembers(true);
        setError('');
        setSuccessMsg('');
        setMemberEmail('');
    };

    const handleCloseMembers = () => {
        setOpenMembers(false);
        setCurrentGroup(null);
        fetchGroups(); // Refresh to update counts
    };

    const handleSubmit = async () => {
        setError('');
        try {
            if (editMode && currentGroup) {
                await groupService.updateGroup(currentGroup._id, formData);
            } else {
                await groupService.createGroup(formData);
            }
            await fetchGroups(); // Ensure list is refreshed
            handleClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this group?')) {
            try {
                await groupService.deleteGroup(id);
                fetchGroups();
            } catch (err) {
                console.error(err);
                alert(err.response?.data?.error || 'Failed to delete');
            }
        }
    };

    const handleAddMember = async () => {
        if (!memberEmail) return;
        try {
            await groupService.addMember(currentGroup._id, memberEmail);
            setSuccessMsg('Member added');
            setMemberEmail('');
            // Refresh current group details
            const updatedGroup = await groupService.getGroupDetails(currentGroup._id);
            setCurrentGroup(updatedGroup.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add member');
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!window.confirm('Remove this user from the group?')) return;
        try {
            await groupService.removeMember(currentGroup._id, userId);
            setSuccessMsg('Member removed');
            // Refresh
            const updatedGroup = await groupService.getGroupDetails(currentGroup._id);
            setCurrentGroup(updatedGroup.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to remove member');
        }
    };

    return (
        <Box sx={{ width: '100%', mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    Group Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen()}
                    sx={{
                        background: 'linear-gradient(45deg, #6F4CFF 30%, #9B6BFE 90%)',
                        color: 'white',
                    }}
                >
                    Create Group
                </Button>
            </Box>

            <TableContainer component={Paper} sx={{ background: 'rgba(26, 32, 44, 0.95)' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ color: '#9CA3AF' }}>Name</TableCell>
                            <TableCell sx={{ color: '#9CA3AF' }}>Manager</TableCell>
                            <TableCell sx={{ color: '#9CA3AF' }}>Members Count</TableCell>
                            <TableCell sx={{ color: '#9CA3AF' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {groups.map((group) => (
                            <TableRow key={group._id}>
                                <TableCell sx={{ color: 'white' }}>{group.name}</TableCell>
                                <TableCell sx={{ color: 'white' }}>{group.manager?.name || 'N/A'}</TableCell>
                                <TableCell sx={{ color: 'white' }}>{group.members?.length || 0}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleOpenMembers(group)} title="Manage Members" sx={{ color: '#A78BFA' }}>
                                        <GroupIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleOpen(group)} sx={{ color: '#60A5FA' }}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(group._id)} sx={{ color: '#EF4444' }}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create/Edit Modal */}
            <Dialog open={open} onClose={handleClose} PaperProps={{ sx: { background: '#1F2937', color: 'white', minWidth: '400px' } }}>
                <DialogTitle>{editMode ? 'Edit Group' : 'Create Group'}</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <TextField
                        margin="dense"
                        label="Group Name"
                        fullWidth
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        sx={{
                            '& .MuiInputBase-root': { color: 'white' },
                            '& .MuiInputLabel-root': { color: '#9CA3AF' },
                            mb: 2
                        }}
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        fullWidth
                        multiline
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        sx={{
                            '& .MuiInputBase-root': { color: 'white' },
                            '& .MuiInputLabel-root': { color: '#9CA3AF' },
                            mb: 2
                        }}
                    />
                    <TextField
                        select
                        margin="dense"
                        label="Manager"
                        fullWidth
                        value={formData.managerId}
                        onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                        sx={{
                            '& .MuiInputBase-root': { color: 'white' },
                            '& .MuiInputLabel-root': { color: '#9CA3AF' },
                            '& .MuiSelect-icon': { color: 'white' }
                        }}
                    >
                        <MenuItem value="">
                            <em>Select Manager</em>
                        </MenuItem>
                        {users.map((user) => (
                            <MenuItem key={user._id} value={user._id}>
                                {user.name} ({user.email})
                            </MenuItem>
                        ))}
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} sx={{ color: '#9CA3AF' }}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" sx={{ background: '#6F4CFF' }}>
                        {editMode ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Manage Members Modal */}
            <Dialog open={openMembers} onClose={handleCloseMembers} maxWidth="md" fullWidth PaperProps={{ sx: { background: '#1F2937', color: 'white' } }}>
                <DialogTitle>Manage Members - {currentGroup?.name}</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

                    <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
                        <Grid item xs={8}>
                            <TextField
                                select
                                label="Add User by Email"
                                fullWidth
                                value={memberEmail}
                                onChange={(e) => setMemberEmail(e.target.value)}
                                sx={{
                                    '& .MuiInputBase-root': { color: 'white' },
                                    '& .MuiInputLabel-root': { color: '#9CA3AF' },
                                    '& .MuiSelect-icon': { color: 'white' }
                                }}
                            >
                                {users.map((user) => (
                                    <MenuItem key={user._id} value={user.email}>
                                        {user.name} ({user.email})
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={4}>
                            <Button variant="contained" startIcon={<PersonAddIcon />} onClick={handleAddMember} fullWidth>
                                Add Member
                            </Button>
                        </Grid>
                    </Grid>

                    <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>Current Members</Typography>
                    <List sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                        {currentGroup?.members?.map((member) => (
                            <React.Fragment key={member._id}>
                                <ListItem>
                                    <ListItemText
                                        primary={member.name}
                                        secondary={<Typography variant="body2" sx={{ color: '#9CA3AF' }}>{member.email}</Typography>}
                                        primaryTypographyProps={{ color: 'white' }}
                                    />
                                    <ListItemSecondaryAction>
                                        {currentGroup.manager?._id !== member._id && (
                                            <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveMember(member._id)} sx={{ color: '#EF4444' }}>
                                                <PersonRemoveIcon />
                                            </IconButton>
                                        )}
                                        {currentGroup.manager?._id === member._id && (
                                            <Typography variant="caption" sx={{ color: '#F59E0B', mr: 2 }}>Manager</Typography>
                                        )}
                                    </ListItemSecondaryAction>
                                </ListItem>
                                <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                            </React.Fragment>
                        ))}
                        {(!currentGroup?.members || currentGroup.members.length === 0) && (
                            <ListItem>
                                <ListItemText primary="No members yet" sx={{ color: '#9CA3AF', fontStyle: 'italic' }} />
                            </ListItem>
                        )}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseMembers} sx={{ color: 'white' }}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default GroupManagement;
