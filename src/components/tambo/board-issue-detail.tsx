"use client";

import { useRouter } from "next/navigation";

interface BoardIssueDetailProps {
  issueId?: string;
  id?: string;
}

export function BoardIssueDetail({ issueId, id }: BoardIssueDetailProps) {
    const router = useRouter();
    
    // Normalize ID
    const displayId = issueId || id || "";

    if (!displayId) return null;

    const openIssue = () => {
        // Append ticketId to current query params
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set("ticketId", displayId);
        router.push(`?${searchParams.toString()}`);
    };

    return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm my-2 max-w-sm">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <span>📄</span> Issue Details
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
                Action required for <span className="font-mono text-primary font-bold">{displayId}</span>
            </p>
            <button 
                onClick={openIssue}
                className="bg-vg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity w-full flex items-center justify-center gap-2"
            >
                Open Details Panel
            </button>
        </div>
    );
}
