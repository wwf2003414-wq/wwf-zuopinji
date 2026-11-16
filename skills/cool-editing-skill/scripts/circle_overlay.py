"""FFmpeg filter graph for a synchronized circular presenter inset."""


def circle_graph(crop, diameter, x, y, *, host='0:v', stage='1:v', output='composed', side_padding=0):
    """Compose a square source crop over a stage of the target output size."""
    left, top, size = crop
    radius = (diameter - 1) / 2
    mask = f'clip(({radius}-hypot(X-{radius},Y-{radius}))*255,0,255)'
    padded_size = size + 2 * side_padding
    edges = ''
    if side_padding:
        edges = (
            f'pad={padded_size}:{padded_size}:{side_padding}:0,'
            f'fillborders=left={side_padding}:right={side_padding}:mode=smear,'
        )
    return (
        f'[{host}]crop={size}:{padded_size}:{left}:{top},{edges}'
        f'scale={diameter}:{diameter}:flags=lanczos,setsar=1,format=yuva420p,'
        f"geq=lum='p(X,Y)':cb='p(X,Y)':cr='p(X,Y)':a='{mask}'[presenter_circle];"
        f'[{stage}][presenter_circle]overlay={x}:{y}:shortest=1[{output}]'
    )
