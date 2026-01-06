import { useToast } from "primevue/usetoast"
// root composable for atm dashboard
export const useAtmDashboard = () => {
    const supabase = useSupabaseClient()
    const toast = useToast()

    const toggleApproved = async (submission: any) => {
        try {
            const { error } = await supabase
                .from("atm_submissions")
                .update({ approved_for_use: submission.approved_for_use })
                .eq("id", submission.id)

            if (error) throw error
            toast.add({
                severity: "success",
                summary: "Success",
                detail: "Status updated",
                life: 3000,
            })
        } catch (error) {
            console.error("Error updating status:", error)
            submission.approved_for_use = !submission.approved_for_use // Revert on error
            toast.add({
                severity: "error",
                summary: "Error",
                detail: "Failed to update status",
                life: 3000,
            })
        }
    }

    const shareSubmission = async (submission: any, event?: Event) => {
        // Stop propagation to prevent row click navigation
        if (event) event.stopPropagation()

        // Handle both submission object or ref wrapper if passed from slug page where it might be a ref. 
        // Ideally we pass the plain object.
        const slug = submission.video_filename
        const shareUrl = `${window.location.origin}/ask-the-mayor-dashboard/${slug}`

        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Ask the Mayor Submission",
                    text: `Check out this submission from ${submission.profiles?.first_name || "a user"
                        }:`,
                    url: shareUrl,
                })
            } catch (err) {
                console.error("Error sharing:", err)
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareUrl)
                toast.add({
                    severity: "info",
                    summary: "Link Copied",
                    detail: "Link copied to clipboard",
                    life: 3000,
                })
            } catch (err) {
                console.error("Error copying to clipboard:", err)
                toast.add({
                    severity: "error",
                    summary: "Error",
                    detail: "Failed to copy link",
                    life: 3000,
                })
            }
        }
    }

    const downloadSubmission = async (submission: any, event?: Event) => {
        if (event) event.stopPropagation()

        try {
            const path = submission.subfolder_date
                ? `atm/${submission.subfolder_date}/${submission.video_filename}`
                : `atm/${submission.video_filename}`

            const { data, error } = await supabase.storage
                .from("media")
                .download(path)

            if (error) throw error

            const url = URL.createObjectURL(data)
            const link = document.createElement("a")
            link.href = url
            link.download = submission.video_filename
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error("Error downloading submission:", error)
            toast.add({
                severity: "error",
                summary: "Error",
                detail: "Failed to download submission",
                life: 3000,
            })
        }
    }

    return {
        toggleApproved,
        shareSubmission,
        downloadSubmission,
    }
}
