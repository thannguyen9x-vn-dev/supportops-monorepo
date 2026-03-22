import { ReactElement } from 'react';
import { AvatarProps as AvatarProps$1 } from '@mui/material/Avatar';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type AvatarVariant = 'circular' | 'rounded' | 'square';
type AvatarRingShape = 'circular' | 'rounded';
type AvatarRingColor = 'default' | 'active' | 'inactive' | string;
type AvatarRingVariant = 'neutral' | 'status';
type AvatarStatus = 'active' | 'inactive';
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
    ring?: boolean;
    ringVariant?: AvatarRingVariant;
    status?: AvatarStatus;
    ringShape?: AvatarRingShape;
    ringColor?: AvatarRingColor;
    ringWidth?: number;
    ringOffset?: number;
}

declare function Avatar({ src, alt, name, size, variant, dimension, className, sx, imgProps, ring, ringVariant, status, ringShape, ringColor, ringWidth, ringOffset, }: AvatarProps): ReactElement;

export { Avatar, type AvatarProps, type AvatarRingColor, type AvatarRingShape, type AvatarRingVariant, type AvatarSize, type AvatarStatus, type AvatarVariant };
