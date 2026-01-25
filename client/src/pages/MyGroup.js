import React, { useState, useEffect, useContext } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    TextField,
    Alert
} from '@mui/material';
import groupService from '../services/groupService';
import { AuthContext } from '../context/AuthContext';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AssessmentIcon from '@mui/icons-material/Assessment';

const MyGroup = () => {
    const { user } = useContext(AuthContext);
    const [group, setGroup] = useState(null);
    const [orders, setOrders] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        processed: 0,
        correctlyProcessed: 0,
        wrong: 0
    });
    const [loading, setLoading] = useState(true);

    // Default to current month or reasonable range? 
    // For now, let's leave empty and let user pick, OR auto-pick today.
    // User said "Auto-Analysis on Date Change".
    const [reportDate, setReportDate] = useState({
        startDate: '',
        endDate: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchGroup();
    }, []);

    // Auto-fetch when dates or group changes
    useEffect(() => {
        if (group && reportDate.startDate && reportDate.endDate) {
            fetchAnalysis();
        }
    }, [group, reportDate.startDate, reportDate.endDate]);

    const fetchGroup = async () => {
        try {
            const res = await groupService.getGroups();
            if (res.data && res.data.length > 0) {
                const managedGroup = res.data.find(g => g.manager._id === user._id);
                if (managedGroup) {
                    setGroup(managedGroup);
                }
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const fetchAnalysis = async () => {
        setError('');
        try {
            const res = await groupService.getGroupReport(group._id, reportDate.startDate, reportDate.endDate);
            const fetchedOrders = res.data;
            setOrders(fetchedOrders);

            const total = fetchedOrders.length;
            const processed = fetchedOrders.filter(o => o.status !== 'pending').length;
            const correctlyProcessed = fetchedOrders.filter(o => o.validationStatus === true).length;
            const wrong = fetchedOrders.filter(o => o.validationStatus === false).length;

            setStats({ total, processed, correctlyProcessed, wrong });

        } catch (err) {
            console.error(err);
            setError('Failed to generate report');
        }
    };

    const handleDownloadReport = () => {
        if (!orders || orders.length === 0) return;

        const headers = [
            'Order Date',
            'Member Name',
            'Member Email',
            'Project',
            'Status',
            'Validation',
            'Validation Message',
            // Customer Info
            'Customer Name',
            'Phone',
            'Email',
            'Address',
            'City',
            'State',
            'Zip',
            // Product Info
            'Product Name',
            'SKU',
            'Source Code',
            // Payment/Trans Info
            'Transaction ID',
            'Session ID',
            'Card Issuer',
            'Last 4',
            'Bank Name'
        ];

        const csvRows = [headers.join(',')];

        orders.forEach(row => {
            const values = [
                row.orderDate || '',
                row.user?.name || '',
                row.user?.email || '',
                row.project || '',
                row.status || '',
                row.validationStatus === true ? 'Valid' : (row.validationStatus === false ? 'Invalid' : 'Pending'),
                row.validationMessage || '',
                // Customer
                `${row.firstName} ${row.lastName}`,
                row.phoneNumber || '',
                row.email || '', // Customer email from order
                `${row.address1} ${row.address2 || ''}`.trim(),
                row.city || '',
                row.state || '',
                row.zipCode || '',
                // Product
                row.productName || '',
                row.sku || '',
                row.sourceCode || '',
                // Trans
                row.transactionId || '',
                row.sessionId || '',
                row.cardIssuer || '',
                row.creditCardLast4 || '',
                row.bankName || ''
            ];

            const escapedValues = values.map(v => `"${String(v || '').replace(/"/g, '""')}"`);
            csvRows.push(escapedValues.join(','));
        });

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `GroupReport_${reportDate.startDate}_${reportDate.endDate}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const StatCard = ({ title, value, icon, color }) => (
        <Card sx={{ bgcolor: 'rgba(26, 32, 44, 0.95)', color: 'white', height: '100%' }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="subtitle2" sx={{ color: '#9CA3AF' }}>{title}</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', my: 1 }}>{value}</Typography>
                    </Box>
                    <Box sx={{ p: 1, borderRadius: 1, bgcolor: `${color}20`, color: color }}>
                        {icon}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );

    if (loading) return <Typography sx={{ color: 'white' }}>Loading...</Typography>;
    if (!group) return <Typography sx={{ color: 'white', p: 3 }}>You do not manage any groups.</Typography>;

    return (
        <Box sx={{ width: '100%', mb: 2 }}>
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 3 }}>
                My Group: {group.name}
            </Typography>

            {/* Date Filter & Actions */}
            <Paper sx={{ p: 3, background: 'rgba(26, 32, 44, 0.95)', mb: 4 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={5}>
                        <TextField
                            type="date"
                            label="Start Date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={reportDate.startDate}
                            onChange={(e) => setReportDate({ ...reportDate, startDate: e.target.value })}
                            sx={{ '& .MuiInputBase-root': { color: 'white' }, '& .MuiInputLabel-root': { color: '#9CA3AF' } }}
                        />
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <TextField
                            type="date"
                            label="End Date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={reportDate.endDate}
                            onChange={(e) => setReportDate({ ...reportDate, endDate: e.target.value })}
                            sx={{ '& .MuiInputBase-root': { color: 'white' }, '& .MuiInputLabel-root': { color: '#9CA3AF' } }}
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <Button
                            variant="contained"
                            startIcon={<FileDownloadIcon />}
                            onClick={handleDownloadReport}
                            disabled={!orders || orders.length === 0}
                            fullWidth
                            size="large"
                            sx={{
                                background: '#6F4CFF',
                                '&.Mui-disabled': {
                                    background: 'rgba(255, 255, 255, 0.12)',
                                    color: 'rgba(255, 255, 255, 0.3)'
                                }
                            }}
                        >
                            CSV
                        </Button>
                    </Grid>
                </Grid>
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            </Paper>

            {/* Analysis Cards - Always visible, initially 0 */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Total Orders" value={stats.total} icon={<AssessmentIcon />} color="#60A5FA" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Processed" value={stats.processed} icon={<ScheduleIcon />} color="#F59E0B" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Correctly Processed" value={stats.correctlyProcessed} icon={<CheckCircleIcon />} color="#10B981" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Wrong / Failed" value={stats.wrong} icon={<ErrorIcon />} color="#EF4444" />
                </Grid>
            </Grid>

            {/* Members List - Read Only */}
            <Paper sx={{ p: 3, background: 'rgba(26, 32, 44, 0.95)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" sx={{ color: 'white' }}>Team Members ({group.members.length})</Typography>
                    {/* Add Member button removed */}
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ color: '#9CA3AF' }}>Name</TableCell>
                                <TableCell sx={{ color: '#9CA3AF' }}>Email</TableCell>
                                <TableCell sx={{ color: '#9CA3AF' }}>ID</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {group.members.map(m => (
                                <TableRow key={m._id}>
                                    <TableCell sx={{ color: 'white' }}>{m.name}</TableCell>
                                    <TableCell sx={{ color: 'white' }}>{m.email}</TableCell>
                                    <TableCell sx={{ color: '#6B7280', fontSize: '0.875rem' }}>{m._id}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default MyGroup;
