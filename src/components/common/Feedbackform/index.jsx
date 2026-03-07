import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const FeedbackForm = () => {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full justify-between" variant="default">
                    <span>Send feedback</span>
                    <i className="bi bi-send-fill ml-2"></i>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0 overflow-hidden">
                <div className="flex-1 w-full bg-background mt-8">
                    <iframe 
                        src="https://docs.google.com/forms/d/e/1FAIpQLSdpJkGv1VMw_lu7GBsKV4lwkdatscw2KZ-WtFfxuq7FrcZacw/viewform?embedded=true" 
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        marginHeight={0} 
                        marginWidth={0}
                        title="Feedback Form"
                    >
                        Loading…
                    </iframe>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default FeedbackForm;