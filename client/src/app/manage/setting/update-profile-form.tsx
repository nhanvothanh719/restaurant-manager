'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import {
  UpdateMeBody,
  UpdateMeBodyType,
} from '@/schemaValidations/account.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  useCurrentUserProfile,
  useUpdateCurrentUserProfileMutation,
} from '@/queries/useAccount';
import { useUploadImageMutation } from '@/queries/useMedia';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/utils';
import envConfig from '@/config';

export default function UpdateProfileForm() {
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<UpdateMeBodyType>({
    resolver: zodResolver(UpdateMeBody),
    defaultValues: {
      name: '',
      avatar: '',
    },
  });
  const userAvatar = useWatch({
    control: form.control,
    name: 'avatar',
  });
  const userName = useWatch({
    control: form.control,
    name: 'name',
  });

  const {
    data: userProfileRes,
    isSuccess: isFetchUserProfileSuccess,
    refetch: refetchUserProfile,
  } = useCurrentUserProfile();

  useEffect(() => {
    if (isFetchUserProfileSuccess) {
      const { name, avatar } = userProfileRes.payload.data;
      form.reset({ name, avatar: avatar ?? undefined });
    }
  }, [isFetchUserProfileSuccess, userProfileRes?.payload.data, form]);

  const previewAvatar = useMemo(() => {
    if (uploadedImageFile) return URL.createObjectURL(uploadedImageFile);
    return userAvatar;
  }, [uploadedImageFile, userAvatar]);

  const handleResetUserInfoChanges = () => {
    form.reset();
    setUploadedImageFile(null);
  };

  const uploadCurrentUserAvatarMutation = useUploadImageMutation();
  const updateCurrentUserProfileMutation =
    useUpdateCurrentUserProfileMutation();

  const handleUpdateUserInfo = async (data: UpdateMeBodyType) => {
    if (updateCurrentUserProfileMutation.isPending) return;
    try {
      let body = data;
      if (uploadedImageFile) {
        const formData = new FormData();
        formData.append('file', uploadedImageFile);
        const uploadImageRes =
          await uploadCurrentUserAvatarMutation.mutateAsync(formData);
        const imageUrl = uploadImageRes.payload.data;
        body = {
          ...data,
          avatar: imageUrl,
        };
      }

      await updateCurrentUserProfileMutation.mutateAsync(body);

      refetchUserProfile();
      toast.success('Update user profile successfully');
    } catch (error) {
      console.error(error);
      handleApiError({
        error,
        setError: form.setError,
      });
    }
  };

  return (
    <Form {...form}>
      <form
        noValidate
        className="grid auto-rows-max items-start gap-4 md:gap-8"
        onReset={handleResetUserInfoChanges}
        onSubmit={form.handleSubmit(handleUpdateUserInfo, (error) => {
          console.error('>>> Fail to update user profile: ', error);
        })}
      >
        <Card x-chunk="dashboard-07-chunk-0">
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex gap-2 items-start justify-start">
                      <Avatar className="aspect-square w-[100px] h-[100px] rounded-md object-cover">
                        <AvatarImage src={previewAvatar} />
                        <AvatarFallback className="rounded-none">
                          {userName}
                        </AvatarFallback>
                      </Avatar>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={avatarInputRef}
                        onChange={(e) => {
                          const uploadedImgFile = e.target.files?.[0];
                          if (!uploadedImgFile) return;
                          setUploadedImageFile(uploadedImgFile);
                          field.onChange(`${envConfig.appUrl}/${field.name}`); // Create fake URL for uploaded image
                        }}
                      />
                      <button
                        type="button"
                        className="flex aspect-square w-[100px] items-center justify-center rounded-md border border-dashed"
                        onClick={() => avatarInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 text-muted-foreground" />
                        <span className="sr-only">Upload</span>
                      </button>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid gap-3">
                      <Label htmlFor="name">Tên</Label>
                      <Input
                        id="name"
                        type="text"
                        className="w-full"
                        {...field}
                      />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <div className=" items-center gap-2 md:ml-auto flex">
                <Button variant="outline" size="sm" type="reset">
                  Hủy
                </Button>
                <Button size="sm" type="submit">
                  Lưu thông tin
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
