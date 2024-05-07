import * as React from "react"

import { Button } from "components/ui/button"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle, } from "@/components/ui/alert"
import {
  Card, CardContent,
  CardDescription, CardFooter,
  CardHeader, CardTitle,
} from "components/ui/card"

import { Input } from "components/ui/input"
import { Label } from "components/ui/label"
import { Loader2 } from 'lucide-react'; // Import Loader icon

export function CreateCard({ onClose }: { onClose: () => void }) {
  const [url, setUrl] = React.useState(''); // State to store the input URL
  const [data, setData] = React.useState(null); // State to store fetched data
  const [loading, setLoading] = React.useState(false); // State to store loading status

  const [error, setError] = React.useState(null); // State to store error status
  const [success, setSuccess] = React.useState<string | null>(null); // State to store success status

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  React.useEffect(() => {
    console.log(data);
  }, [data]);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);
    if (url) {
      try {
        const response = await fetch(url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/'));
        if (response.ok) {
          setData(await response.json()); // Parsing response to JSON
          setSuccess('Database uploaded successfully');
        } else {
          console.error('Failed to fetch:', response.statusText);
          setError(response.statusText as any);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    setLoading(false); // Stop loading after fetching is complete
  };

  return (
    <Card className="w-[550px] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <CardHeader>
        <CardTitle>Upload Database</CardTitle>
        <CardDescription>
          This will upload your database to the server. Once processed, you will be able to access it from the dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Database URL</Label>
              <Input id="url" value={url} onChange={handleInputChange} placeholder="https://github.com/..." />
            </div>

            {/* Show error if any */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>)
            }

            {/* Show success if any */}
            {success && (
              <Alert variant="success">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  {success}
                </AlertDescription>
              </Alert>)
            }
            {success && (
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Preview</Label>
                <pre>{JSON.stringify(data, null, 2)}</pre>
              </div>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" onClick={handleUpload}>
          {loading ? <Loader2 className="animate-spin" /> : 'Upload'}
        </Button>
      </CardFooter>
    </Card>
  )
}
