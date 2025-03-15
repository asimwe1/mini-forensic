"use client";

import { useState } from "react";
import { useLanguage } from "@/components/language-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FileText, Download, Eye, FileCheck } from "lucide-react";
import { motion } from "framer-motion";
import { LabSidebar } from "@/components/lab-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function ReportsPage() {
  const { t } = useLanguage();
  const [generating, setGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  const handleGenerateReport = () => {
    setGenerating(true);

    // Simulate report generation
    setTimeout(() => {
      setGenerating(false);
      setReportGenerated(true);
    }, 3000);
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <LabSidebar />
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-4 space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">
              {t("generateReport")}
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("generateReport")}</CardTitle>
                  <CardDescription>
                    Create a comprehensive forensic analysis report
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="sections">
                    <TabsList className="grid grid-cols-2 mb-4">
                      <TabsTrigger value="sections">Sections</TabsTrigger>
                      <TabsTrigger value="format">Format</TabsTrigger>
                    </TabsList>

                    <TabsContent value="sections" className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="section-summary" defaultChecked />
                          <Label htmlFor="section-summary">
                            Executive Summary
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="section-network" defaultChecked />
                          <Label htmlFor="section-network">
                            Network Analysis
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="section-memory" defaultChecked />
                          <Label htmlFor="section-memory">
                            Memory Analysis
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="section-filesystem" defaultChecked />
                          <Label htmlFor="section-filesystem">
                            File System Analysis
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="section-timeline" defaultChecked />
                          <Label htmlFor="section-timeline">Timeline</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="section-ioc" defaultChecked />
                          <Label htmlFor="section-ioc">
                            Indicators of Compromise
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="section-recommendations"
                            defaultChecked
                          />
                          <Label htmlFor="section-recommendations">
                            Recommendations
                          </Label>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="format" className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="format-pdf" defaultChecked />
                          <Label htmlFor="format-pdf">PDF</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="format-html" />
                          <Label htmlFor="format-html">HTML</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="format-json" />
                          <Label htmlFor="format-json">JSON</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="format-csv" />
                          <Label htmlFor="format-csv">CSV (data only)</Label>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleGenerateReport}
                    disabled={generating}
                    className="w-full"
                  >
                    {generating ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Generating Report...
                      </span>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        {t("generateReport")}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Report Preview</CardTitle>
                  <CardDescription>
                    3D visualization of your forensic report
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] relative">
                  {reportGenerated ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 rounded-md">
                      <div className="text-primary text-2xl font-bold mb-4 glow">
                        REPORT READY
                      </div>

                      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                        <Button>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                        <Button variant="outline">
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <FileCheck className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          Generate a report to see a preview
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {reportGenerated && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-accent glow-accent">
                  <CardHeader>
                    <CardTitle className="text-accent">
                      Report Generated Successfully
                    </CardTitle>
                    <CardDescription>
                      Your forensic analysis report is ready for download
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium mb-2">Report Details</h3>
                        <ul className="space-y-1 text-sm">
                          <li>Created: {new Date().toLocaleString()}</li>
                          <li>Size: 2.4 MB</li>
                          <li>Format: PDF</li>
                          <li>Pages: 24</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-medium mb-2">Findings Summary</h3>
                        <ul className="space-y-1 text-sm">
                          <li>Critical Issues: 2</li>
                          <li>Warnings: 5</li>
                          <li>Information: 12</li>
                          <li>Artifacts Analyzed: 145</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-2">
                    <Button variant="outline">
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                    <Button>
                      <Download className="mr-2 h-4 w-4" />
                      Download Report
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
