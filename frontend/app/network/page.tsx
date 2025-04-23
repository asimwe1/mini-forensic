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
import { useToast } from '@/hooks/use-toast';
import { apiService, NetworkAnalysisResponse } from '@/services/api';
import { AnimatePresence, motion } from 'framer-motion';
import {
	Activity,
	Download,
	Filter,
	Globe,
	Info,
	Network,
	Search,
	Wifi,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface NetworkConnection {
	id: string;
	source: string;
	destination: string;
	protocol: string;
	port: number;
	status: 'active' | 'closed';
	timestamp: string;
	bytes: number;
}

export default function NetworkPage() {
	const { t } = useLanguage();
	const { toast } = useToast();
	const [connections, setConnections] = useState<NetworkConnection[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedConnection, setSelectedConnection] =
		useState<NetworkConnection | null>(null);
	const [filterProtocol, setFilterProtocol] = useState<string>('all');
	const [analysis, setAnalysis] = useState<NetworkAnalysisResponse | null>(
		null
	);
	const [loading, setLoading] = useState(true);
	const [websocket, setWebsocket] = useState<WebSocket | null>(null);

	useEffect(() => {
		// Load initial data
		const loadData = async () => {
			try {
				setLoading(true);
				// TODO: Replace with actual file ID from route or state
				const fileId = 1;
				const response = await apiService.getNetworkAnalysis(fileId);
				setAnalysis(response);
				setConnections(response.result.connections);
			} catch (error) {
				console.error('Failed to load network analysis:', error);
				toast({
					title: 'Error',
					description: 'Failed to load network analysis data',
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
			const ws = apiService.connectNetworkWebSocket(analysis.id);

			ws.onmessage = (event) => {
				const data = JSON.parse(event.data);
				if (data.type === 'initial_data') {
					setConnections(data.data.connections);
				} else if (data.type === 'update') {
					setConnections((prev) => [...prev, ...data.data.new_connections]);
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

	const filteredConnections = connections.filter((conn) => {
		const matchesSearch =
			conn.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
			conn.destination.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesProtocol =
			filterProtocol === 'all' ||
			conn.protocol.toLowerCase() === filterProtocol.toLowerCase();
		return matchesSearch && matchesProtocol;
	});

	const handleConnectionClick = (connection: NetworkConnection) => {
		setSelectedConnection(connection);
	};

	const handleDownload = async () => {
		try {
			// TODO: Implement download functionality
			toast({
				title: 'Download Started',
				description: 'Network analysis data is being downloaded',
			});
		} catch (error) {
			console.error('Download failed:', error);
			toast({
				title: 'Error',
				description: 'Failed to download network analysis data',
				variant: 'destructive',
			});
		}
	};

	return (
		<DashboardLayout>
			<div className="flex-1 space-y-4 p-8 pt-6">
				<div className="flex items-center justify-between space-y-2">
					<h2 className="text-3xl font-bold tracking-tight">
						Network Analysis
					</h2>
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
								Total Connections
							</CardTitle>
							<Network className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{connections.length}</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Active Connections
							</CardTitle>
							<Activity className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{connections.filter((c) => c.status === 'active').length}
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Traffic
							</CardTitle>
							<Globe className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{(
									connections.reduce((acc, conn) => acc + conn.bytes, 0) /
									1024 /
									1024
								).toFixed(2)}{' '}
								MB
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Protocols</CardTitle>
							<Wifi className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{new Set(connections.map((c) => c.protocol)).size}
							</div>
						</CardContent>
					</Card>
				</div>

				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle>Network Connections</CardTitle>
								<CardDescription>
									Real-time network traffic analysis
								</CardDescription>
							</div>
							<div className="flex items-center space-x-4">
								<div className="flex items-center space-x-2">
									<Input
										placeholder="Search connections..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="w-[200px]"
									/>
									<Select
										value={filterProtocol}
										onValueChange={setFilterProtocol}
									>
										<SelectTrigger className="w-[120px]">
											<SelectValue placeholder="Protocol" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">All</SelectItem>
											<SelectItem value="tcp">TCP</SelectItem>
											<SelectItem value="udp">UDP</SelectItem>
											<SelectItem value="icmp">ICMP</SelectItem>
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
										<TableHead>Source</TableHead>
										<TableHead>Destination</TableHead>
										<TableHead>Protocol</TableHead>
										<TableHead>Port</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Bytes</TableHead>
										<TableHead>Time</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredConnections.map((connection) => (
										<TableRow
											key={connection.id}
											className="cursor-pointer hover:bg-muted/50"
											onClick={() => handleConnectionClick(connection)}
										>
											<TableCell>{connection.source}</TableCell>
											<TableCell>{connection.destination}</TableCell>
											<TableCell>{connection.protocol}</TableCell>
											<TableCell>{connection.port}</TableCell>
											<TableCell>
												<Badge
													variant={
														connection.status === 'active'
															? 'default'
															: 'secondary'
													}
												>
													{connection.status}
												</Badge>
											</TableCell>
											<TableCell>
												{(connection.bytes / 1024).toFixed(2)} KB
											</TableCell>
											<TableCell>
												{new Date(connection.timestamp).toLocaleString()}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</ScrollArea>
					</CardContent>
				</Card>

				<AnimatePresence>
					{selectedConnection && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 20 }}
							className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
							onClick={() => setSelectedConnection(null)}
						>
							<Card className="w-[600px]">
								<CardHeader>
									<CardTitle>Connection Details</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div>
											<h4 className="font-medium">Source</h4>
											<p>{selectedConnection.source}</p>
										</div>
										<div>
											<h4 className="font-medium">Destination</h4>
											<p>{selectedConnection.destination}</p>
										</div>
										<div>
											<h4 className="font-medium">Protocol</h4>
											<p>{selectedConnection.protocol}</p>
										</div>
										<div>
											<h4 className="font-medium">Port</h4>
											<p>{selectedConnection.port}</p>
										</div>
										<div>
											<h4 className="font-medium">Status</h4>
											<Badge
												variant={
													selectedConnection.status === 'active'
														? 'default'
														: 'secondary'
												}
											>
												{selectedConnection.status}
											</Badge>
										</div>
										<div>
											<h4 className="font-medium">Data Transferred</h4>
											<p>{(selectedConnection.bytes / 1024).toFixed(2)} KB</p>
										</div>
										<div>
											<h4 className="font-medium">Timestamp</h4>
											<p>
												{new Date(
													selectedConnection.timestamp
												).toLocaleString()}
											</p>
										</div>
									</div>
								</CardContent>
								<CardFooter>
									<Button onClick={() => setSelectedConnection(null)}>
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
