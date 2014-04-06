uniform sampler2D ntex;
uniform sampler2D dtex;
//uniform sampler2D cloudtex;

uniform vec3 direction;
uniform vec3 col;
uniform mat4 invproj;
//uniform int hasclouds;
//uniform vec2 wind;

#if __VERSION__ >= 130
in vec2 uv;
out vec4 Diff;
out vec4 Spec;
#else
varying vec2 uv;
#define Diff gl_FragData[0]
#define Spec gl_FragData[1]
#endif


vec3 DecodeNormal(vec2 n);

void main() {
	float z = texture(dtex, uv).x;
	vec4 xpos = 2.0 * vec4(uv, z, 1.0) - 1.0;
	xpos = invproj * xpos;
	xpos.xyz /= xpos.w;

	if (z < 0.03)
	{
		// Skyboxes are fully lit
		Diff = vec4(1.0);
		Spec = vec4(1.0);
		return;
	}

	vec3 norm = normalize(DecodeNormal(2. * texture(ntex, uv).xy - 1.));
    float roughness = texture(ntex, uv).z;
    vec3 eyedir = -normalize(xpos.xyz);

	// Normalized on the cpu
    vec3 L = direction;
    // Half Light View direction
    vec3 H = normalize(eyedir + L);

    float NdotL = max(0., dot(norm, L));
    float NdotH = max(0., dot(norm, H));

    float normalisationFactor = (roughness + 2.) / 8.;
	float Specular = pow(NdotH, roughness) * NdotL * normalisationFactor;

	vec3 outcol = NdotL * col;

/*	if (hasclouds == 1)
	{
		vec2 cloudcoord = (xpos.xz * 0.00833333) + wind;
		float cloud = texture(cloudtex, cloudcoord).x;
		//float cloud = step(0.5, cloudcoord.x) * step(0.5, cloudcoord.y);

		outcol *= cloud;
	}*/

	Diff = vec4(NdotL * col, 1.);
	Spec = vec4(Specular * col, 1.);
}
