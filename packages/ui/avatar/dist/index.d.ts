import { ReactElement } from 'react';
import { AvatarProps as AvatarProps$1 } from '@mui/material/Avatar';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type AvatarVariant = 'circular' | 'rounded' | 'square';
interface AvatarProps {
    src?: string | null;
    alt?: string;
    name?: string;
    size?: AvatarSize;
    variant?: AvatarVariant;
    dimension?: number;
    className?: string;
    sx?: AvatarProps$1['sx'];
    imgProps?: AvatarProps$1['imgProps'];
}

declare function Avatar({ src, alt, name, size, variant, dimension, className, sx, imgProps, }: AvatarProps): ReactElement;

export { Avatar, type AvatarProps, type AvatarSize, type AvatarVariant };
