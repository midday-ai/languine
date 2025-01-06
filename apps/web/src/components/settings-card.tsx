import { CopyInput } from "@/components/copy-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function SettingsTitle({ title }: { title: string }) {
  return (
    <h2 className="text-lg p-8 pl-0 pt-6 font-normal font-mono">{title}</h2>
  );
}

export function SettingsSeparator() {
  return <div className="w-full h-12 bg-dotted my-12 max-w-screen-xl" />;
}

export function SettingsCard({
  title,
  description,
  type = "input",
  value,
  onChange,
  checked,
  onCheckedChange,
  options,
  placeholder,
}: {
  title: string;
  description: string;
  type?: "input" | "textarea" | "switch" | "select" | "copy-input";
  value?: string;
  onChange?: (value: string) => void;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  options?: { label: string; value: string }[];
  placeholder?: string;
}) {
  return (
    <div className="mb-8 max-w-screen-xl">
      <Card className="w-full bg-noise">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-normal mb-2">
                {title}
              </CardTitle>
              <p className="text-sm text-secondary">{description}</p>
            </div>
            {type === "switch" && (
              <Switch
                checked={checked}
                onCheckedChange={() => {
                  onCheckedChange?.(!!checked);
                  toast("Settings saved", {
                    description: "Your changes have been saved successfully",
                  });
                }}
              />
            )}

            {type === "select" && options && (
              <div className="min-w-[240px]">
                <Select value={value} onValueChange={onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {type === "input" && (
            <Input
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              placeholder={placeholder}
            />
          )}
          {type === "textarea" && (
            <Textarea
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              rows={4}
              placeholder={placeholder}
            />
          )}
          {type === "copy-input" && value && (
            <CopyInput value={value} placeholder={placeholder} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
