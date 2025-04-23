'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { LabSidebar } from '@/components/lab-sidebar';
import { useLanguage } from '@/components/language-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { SidebarProvider } from '@/components/ui/sidebar';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiService, MemoryAnalysisResponse } from '@/services/api';
import { AnimatePresence, motion } from 'framer-motion';
import {
	BarChart3,
	Binary,
	Download,
	Filter,
	Hexagon,
	Info,
	Search,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface MemoryRegion {
	address: string;
	size: number;
	type: string;
	permissions: string;
	description: string;
	content?: string;
}

interface ProcessInfo {
	pid: number;
	name: string;
	memoryUsage: number;
	threads: number;
	status: string;
}

export default function MemoryPage() {
	const { t } = useLanguage();
	const { toast } = useToast();
	const [processes, setProcesses] = useState<ProcessInfo[]>([]);
	const [memoryRegions, setMemoryRegions] = useState<MemoryRegion[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [filterStatus, setFilterStatus] = useState<string>('all');
	const [selectedProcess, setSelectedProcess] = useState<ProcessInfo | null>(
		null
	);
	const [analysis, setAnalysis] = useState<MemoryAnalysisResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [websocket, setWebsocket] = useState<WebSocket | null>(null);

	useEffect(() => {
		// Load initial data
		const loadData = async () => {
			try {
				setLoading(true);
				// TODO: Replace with actual file ID from route or state
				const fileId = 1;
				const response = await apiService.getMemoryAnalysis(fileId);
				setAnalysis(response);
				setProcesses(response.result.processes);
				setMemoryRegions(response.result.memory_regions);
			} catch (error) {
				console.error('Failed to load memory analysis:', error);
				toast({
					title: 'Error',
					description: 'Failed to load memory analysis data',
					variant: 'destructive',
				});
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, []);

	useEffect(() => {
		// Setup WebSocket connection
		if (analysis?.id) {
			const ws = apiService.connectMemoryWebSocket(analysis.id);

			ws.onmessage = (event) => {
				const data = JSON.parse(event.data);
				if (data.type === 'initial_data') {
					setProcesses(data.data.processes);
					setMemoryRegions(data.data.memory_regions);
				} else if (data.type === 'update') {
					setProcesses((prev) =>
						prev.map((proc) => {
							const update = data.data.process_updates.find(
								(u) => u.pid === proc.pid
							);
							return update ? { ...proc, ...update } : proc;
						})
					);
				}
			};

			ws.onerror = (error) => {
				console.error('WebSocket error:', error);
				toast({
					title: 'Connection Error',
					description: 'Lost connection to real-time updates',
					variant: 'destructive',
				});
			};

			setWebsocket(ws);

			return () => {
				ws.close();
			};
		}
	}, [analysis?.id]);

	const filteredProcesses = processes.filter((proc) => {
		const matchesSearch =
			proc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			proc.pid.toString().includes(searchQuery);
		const matchesStatus =
			filterStatus === 'all' ||
			proc.status.toLowerCase() === filterStatus.toLowerCase();
		return matchesSearch && matchesStatus;
	});

	const handleProcessClick = (process: ProcessInfo) => {
		setSelectedProcess(process);
	};

	const handleDownload = async () => {
		try {
			// TODO: Implement download functionality
			toast({
				title: 'Download Started',
				description: 'Memory analysis data is being downloaded',
			});
		} catch (error) {
			console.error('Download failed:', error);
			toast({
				title: 'Error',
				description: 'Failed to download memory analysis data',
				variant: 'destructive',
			});
		}
	};

	return (
		<DashboardLayout>
			<div className="flex-1 space-y-4 p-8 pt-6">
				<div className="flex items-center justify-between space-y-2">
					<h2 className="text-3xl font-bold tracking-tight">Memory Analysis</h2>
					<div className="flex items-center space-x-4">
						<Button onClick={handleDownload}>
							<Download className="mr-2 h-4 w-4" />
							Download
						</Button>
					</div>
				</div>

				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Processes
							</CardTitle>
							<Hexagon className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{processes.length}</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Active Processes
							</CardTitle>
							<Binary className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{processes.filter((p) => p.status === 'running').length}
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Memory
							</CardTitle>
							<BarChart3 className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{(
									analysis?.result.statistics.total_memory /
									1024 /
									1024 /
									1024
								).toFixed(2)}{' '}
								GB
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Used Memory</CardTitle>
							<Info className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{(
									analysis?.result.statistics.used_memory /
									1024 /
									1024 /
									1024
								).toFixed(2)}{' '}
								GB
							</div>
						</CardContent>
					</Card>
				</div>

				<Tabs defaultValue="processes" className="space-y-4">
					<TabsList>
						<TabsTrigger value="processes">Processes</TabsTrigger>
						<TabsTrigger value="memory">Memory Regions</TabsTrigger>
					</TabsList>

					<TabsContent value="processes">
						<Card>
							<CardHeader>
								<div className="flex items-center justify-between">
									<div>
										<CardTitle>Process List</CardTitle>
										<CardDescription>
											Real-time process information
										</CardDescription>
									</div>
									<div className="flex items-center space-x-4">
										<div className="flex items-center space-x-2">
											<Input
												placeholder="Search processes..."
												value={searchQuery}
												onChange={(e) => setSearchQuery(e.target.value)}
												className="w-[200px]"
											/>
											<Select
												value={filterStatus}
												onValueChange={setFilterStatus}
											>
												<SelectTrigger className="w-[120px]">
													<SelectValue placeholder="Status" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="all">All</SelectItem>
													<SelectItem value="running">Running</SelectItem>
													<SelectItem value="stopped">Stopped</SelectItem>
													<SelectItem value="suspended">Suspended</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<ScrollArea className="h-[400px]">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>PID</TableHead>
												<TableHead>Name</TableHead>
												<TableHead>Memory Usage</TableHead>
												<TableHead>Threads</TableHead>
												<TableHead>Status</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{filteredProcesses.map((process) => (
												<TableRow
													key={process.pid}
													className="cursor-pointer hover:bg-muted/50"
													onClick={() => handleProcessClick(process)}
												>
													<TableCell>{process.pid}</TableCell>
													<TableCell>{process.name}</TableCell>
													<TableCell>
														{(process.memoryUsage / 1024 / 1024).toFixed(2)} MB
													</TableCell>
													<TableCell>{process.threads}</TableCell>
													<TableCell>
														<Badge
															variant={
																process.status === 'running'
																	? 'default'
																	: 'secondary'
															}
														>
															{process.status}
														</Badge>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</ScrollArea>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="memory">
						<Card>
							<CardHeader>
								<CardTitle>Memory Regions</CardTitle>
								<CardDescription>Memory layout and permissions</CardDescription>
							</CardHeader>
							<CardContent>
								<ScrollArea className="h-[400px]">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Address</TableHead>
												<TableHead>Size</TableHead>
												<TableHead>Type</TableHead>
												<TableHead>Permissions</TableHead>
												<TableHead>Description</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{memoryRegions.map((region) => (
												<TableRow key={region.address}>
													<TableCell>{region.address}</TableCell>
													<TableCell>
														{(region.size / 1024).toFixed(2)} KB
													</TableCell>
													<TableCell>{region.type}</TableCell>
													<TableCell>{region.permissions}</TableCell>
													<TableCell>{region.description}</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</ScrollArea>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>

				<AnimatePresence>
					{selectedProcess && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 20 }}
							className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
							onClick={() => setSelectedProcess(null)}
						>
							<Card className="w-[600px]">
								<CardHeader>
									<CardTitle>Process Details</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div>
											<h4 className="font-medium">Process ID</h4>
											<p>{selectedProcess.pid}</p>
										</div>
										<div>
											<h4 className="font-medium">Name</h4>
											<p>{selectedProcess.name}</p>
										</div>
										<div>
											<h4 className="font-medium">Memory Usage</h4>
											<p>
												{(selectedProcess.memoryUsage / 1024 / 1024).toFixed(2)}{' '}
												MB
											</p>
										</div>
										<div>
											<h4 className="font-medium">Threads</h4>
											<p>{selectedProcess.threads}</p>
										</div>
										<div>
											<h4 className="font-medium">Status</h4>
											<Badge
												variant={
													selectedProcess.status === 'running'
														? 'default'
														: 'secondary'
												}
											>
												{selectedProcess.status}
											</Badge>
										</div>
									</div>
								</CardContent>
								<CardFooter>
									<Button onClick={() => setSelectedProcess(null)}>
										Close
									</Button>
								</CardFooter>
							</Card>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</DashboardLayout>
	);
}
