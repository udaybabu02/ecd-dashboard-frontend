import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Bell, FileText, ExternalLink, Upload, File, FileSpreadsheet, Link2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UploadedResource } from "@/api/resourcesAPI";
import { getUploadedResources, deleteUploadedResource } from "@/api/resourcesAPI";

// CHANGED TO RELATIVE PATHS (../) TO ENSURE VERCEL FINDS THEM
import rbskLogo from "../assets/rbsk-logo.png";
import apGovtLogo from "../assets/ap-govt-logo.png";
import icmrLogo from "../assets/icmr-logo.png";

const DUMMY_NOTIFICATIONS: { date: string; title: string; description: string; priority: string }[] = [
  { date: "12 Feb 2026", title: "Nutrition Training", description: "New training available for Anganwadi workers", priority: "Medium" },
  { date: "10 Feb 2026", title: "High Risk Alert", description: "Increase in high-risk children in Krishna district", priority: "High" },
  { date: "5 Feb 2026", title: "Follow-up Reminder", description: "Pending follow-ups need attention", priority: "Low" },
];

const DUMMY_RESOURCES: { title: string; type: string; link: string; logo: string }[] = [
  { title: "Rashtriya Bal Swasthya Karyakram (RBSK)", type: "Government Health Program", link: "https://rbsk.mohfw.gov.in/RBSK/", logo: rbskLogo },
  { title: "Women Development & Child Welfare (AP)", type: "Government Department Portal", link: "https://wdcw.ap.gov.in/", logo: apGovtLogo },
  { title: "Indian Council of Medical Research (ICMR)", type: "National Research Organization", link: "https://www.icmr.gov.in/", logo: icmrLogo },
];

const priorityStyles: Record<string, string> = {
  High: "bg-[hsl(0,72%,51%,0.12)] text-[hsl(0,72%,51%)]",
  Medium: "bg-[hsl(40,90%,50%,0.12)] text-[hsl(40,90%,40%)]",
  Low: "bg-[hsl(160,65%,40%,0.12)] text-[hsl(160,65%,40%)]",
};

const typeIcons: Record<string, typeof File> = {
  "Excel File": FileSpreadsheet,
  "API Link": Link2,
};

const ResourcesTab = () => {
  const [uploadedResources, setUploadedResources] = useState<UploadedResource[]>([]);

  useEffect(() => {
    const fetchResources = async () => {
      const data = await getUploadedResources();
      setUploadedResources(data);
    };
    fetchResources();
  }, []);

  const handleDelete = async (id: string | number) => {
    await deleteUploadedResource(id);
    const updatedList = await getUploadedResources();
    setUploadedResources(updatedList);
  };

  const openResource = (url: string) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#0f4c81]" />
          <h2 className="text-xl font-semibold text-foreground">Resources & Notifications</h2>
        </div>
        
        {/* Blue Upload Button matching screenshot */}
        <Button className="bg-[#1e4b7a] hover:bg-[#163a5f] text-white gap-2 h-9 px-4">
          <Upload className="w-4 h-4" />
          <span>Upload Resource</span>
        </Button>
      </div>

      {/* Notifications Section */}
      <Card className="p-5 animate-fade-in shadow-sm border-border/60">
        <div className="flex items-center gap-2 mb-6">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-base font-medium">Notifications</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground border-b border-border/40">
                <th className="text-left py-3 px-2 font-medium">Date</th>
                <th className="text-left py-3 px-2 font-medium">Title</th>
                <th className="text-left py-3 px-2 font-medium">Description</th>
                <th className="text-right py-3 px-2 font-medium">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {DUMMY_NOTIFICATIONS.map((n, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  <td className="py-4 px-2 text-muted-foreground">{n.date}</td>
                  <td className="py-4 px-2 font-semibold text-foreground">{n.title}</td>
                  <td className="py-4 px-2 text-muted-foreground">{n.description}</td>
                  <td className="py-4 px-2 text-right">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${priorityStyles[n.priority]}`}>
                      {n.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Uploaded Resources Section (Dynamic) */}
      {uploadedResources.length > 0 && (
        <Card className="p-5 animate-fade-in shadow-sm border-border/60">
          <div className="flex items-center gap-2 mb-4">
            <Upload className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-base font-medium">Uploaded Resources</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {uploadedResources.map((r) => {
              const Icon = typeIcons[r.type || ""] || File;
              return (
                <div
                  key={r.id}
                  className="group relative flex items-start gap-3 p-4 rounded-xl bg-muted/20 border border-border/40 hover:bg-muted/40 transition-all cursor-pointer"
                  onClick={() => openResource(r.url)}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <p className="text-sm font-semibold text-foreground truncate">{r.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-1 uppercase tracking-wider">{r.type}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Official Resource Links Section (Always Bottom) */}
      <Card className="p-5 animate-fade-in shadow-sm border-border/60">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-base font-medium">Resource Links</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DUMMY_RESOURCES.map((r, i) => (
            <a
              key={i}
              href={r.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-xl bg-muted/20 border border-border/40 hover:bg-muted/40 transition-all group"
            >
              <div className="w-12 h-12 rounded-lg bg-white shadow-sm flex items-center justify-center p-1.5 shrink-0 border border-border/30">
                <img src={r.logo} alt={r.title} className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-foreground leading-tight mb-1 group-hover:text-primary transition-colors">
                  {r.title}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {r.type}
                </p>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ResourcesTab;